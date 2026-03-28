-- Run this in Supabase → SQL Editor (once per project).
-- Then: Database → Replication → enable supabase_realtime for orders, ingredients, pos_settings (or use SQL below).

create table if not exists public.ingredients (
  id text primary key,
  name text not null,
  stock numeric not null default 0,
  unit text not null,
  low_stock_threshold numeric not null default 0
);

create table if not exists public.pos_settings (
  id int primary key check (id = 1),
  order_counter int not null default 1
);

create table if not exists public.orders (
  order_number int primary key,
  customer_name text not null,
  items jsonb not null,
  status text not null,
  chef_name text,
  server_name text,
  total_price numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ingredients enable row level security;
alter table public.pos_settings enable row level security;
alter table public.orders enable row level security;

-- Anonymous sign-in yields role "authenticated" in Supabase.
create policy "ingredients_rw_authenticated" on public.ingredients
  for all to authenticated using (true) with check (true);

create policy "pos_settings_rw_authenticated" on public.pos_settings
  for all to authenticated using (true) with check (true);

create policy "orders_rw_authenticated" on public.orders
  for all to authenticated using (true) with check (true);

create or replace function public.create_pos_order(
  p_customer_name text,
  p_items jsonb,
  p_total_price numeric,
  p_ingredient_usage jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_counter int;
  v_order_number int;
  r record;
  ing_id text;
  amt numeric;
  cur_stock numeric;
  result jsonb;
begin
  select order_counter into v_counter from public.pos_settings where id = 1 for update;
  if not found then
    insert into public.pos_settings (id, order_counter) values (1, 1);
    v_counter := 1;
  end if;

  v_order_number := v_counter;

  for r in select jsonb_array_elements(coalesce(p_ingredient_usage, '[]'::jsonb)) as elem
  loop
    ing_id := r.elem->>'ingredient_id';
    amt := coalesce((r.elem->>'amount')::numeric, 0);
    if ing_id is null or amt <= 0 then
      continue;
    end if;
    select stock into cur_stock from public.ingredients where id = ing_id for update;
    if not found then
      raise exception 'Unknown ingredient: %', ing_id;
    end if;
    if cur_stock < amt then
      raise exception 'Insufficient stock: %', ing_id;
    end if;
    update public.ingredients set stock = greatest(0, stock - amt) where id = ing_id;
  end loop;

  insert into public.orders (order_number, customer_name, items, status, total_price, created_at, updated_at)
  values (v_order_number, p_customer_name, p_items, 'waiting', p_total_price, now(), now());

  update public.pos_settings set order_counter = v_counter + 1 where id = 1;

  select jsonb_build_object(
    'id', o.order_number,
    'customerName', o.customer_name,
    'items', o.items,
    'status', o.status,
    'chefName', o.chef_name,
    'serverName', o.server_name,
    'createdAt', o.created_at,
    'updatedAt', o.updated_at,
    'totalPrice', o.total_price
  ) into result
  from public.orders o
  where o.order_number = v_order_number;

  return result;
end;
$$;

create or replace function public.reset_pos()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.orders;
  insert into public.pos_settings (id, order_counter)
  values (1, 1)
  on conflict (id) do update set order_counter = excluded.order_counter;
end;
$$;

revoke all on function public.create_pos_order(text, jsonb, numeric, jsonb) from public;
revoke all on function public.reset_pos() from public;

grant execute on function public.create_pos_order(text, jsonb, numeric, jsonb) to authenticated;
grant execute on function public.reset_pos() to authenticated;

-- Realtime (ignore errors if already added)
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.ingredients;
alter publication supabase_realtime add table public.pos_settings;
