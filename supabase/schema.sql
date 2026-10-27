-- ============================================================
-- USAHA.IN — SUPABASE DATABASE SCHEMA
-- Multi-Tenant, Row-Level-Security, and ACID Transactions
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TENANTS (UMKM Profiles & Configurations)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  business_type TEXT DEFAULT 'dagang',
  business_settings JSONB DEFAULT '{
    "businessType": "dagang",
    "useStock": true,
    "useProduction": false,
    "useShipping": true,
    "useCredit": true,
    "defaultShopeeFeePct": 7.5,
    "defaultTokopediaFeePct": 3.5,
    "initialCash": 15000000,
    "initialReceivable": 1200000,
    "initialPayable": 1850000,
    "initialLocked": false
  }'::jsonb,
  city TEXT,
  province TEXT,
  address TEXT,
  phone TEXT,
  channels TEXT[] DEFAULT ARRAY['offline', 'chat', 'marketplace']::TEXT[],
  nib TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS (Profile & RBAC, linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_email TEXT,
  phone TEXT,
  is_owner BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  template TEXT DEFAULT 'Karyawan',
  permissions JSONB DEFAULT '{
    "dashboard": "view",
    "penjualan": "view",
    "produk": "view",
    "stok": "view",
    "pengeluaran": "none",
    "pembayaran": "none",
    "pengiriman": "none",
    "pelanggan": "none",
    "laporan_keuangan": "none",
    "laporan_periodik": "none",
    "analitik": "none",
    "copilot": "none"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_auth_owner()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_owner, false) FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. PRODUCTS & STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  product_type TEXT DEFAULT 'dagang',
  track_stock BOOLEAN DEFAULT true,
  sell_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  buy_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  avg_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 5,
  channels TEXT[] DEFAULT ARRAY['offline', 'chat', 'marketplace']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, sku)
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'adjustment')),
  qty INT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ref_id TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CUSTOMERS & SUPPLIERS
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'offline',
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS & SALE PAYMENTS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  order_number TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  channel TEXT NOT NULL DEFAULT 'offline',
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  admin_fee NUMERIC(15, 2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'lunas' CHECK (payment_status IN ('lunas', 'sebagian', 'belum', 'gagal')),
  shipment_status TEXT NOT NULL DEFAULT 'selesai' CHECK (shipment_status IN ('baru', 'diproses', 'dikemas', 'dikirim', 'selesai')),
  due_date DATE,
  note TEXT,
  external_order_id TEXT,
  voided BOOLEAN DEFAULT false,
  voided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  qty INT NOT NULL CHECK (qty > 0),
  unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  cogs_unit NUMERIC(15, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.sale_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PURCHASES (Pembelian Stok)
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  qty INT NOT NULL CHECK (qty > 0),
  buy_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXPENSES & CATEGORIES
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_type TEXT NOT NULL CHECK (group_type IN ('cogs', 'selling', 'operating', 'other', 'non_expense')),
  active BOOLEAN DEFAULT true,
  is_stock_related BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  paid BOOLEAN DEFAULT true,
  due_date DATE,
  vendor TEXT,
  note TEXT,
  budget_exceed_reason TEXT,
  is_prive BOOLEAN DEFAULT false,
  paid_date DATE,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expense_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  qty INT NOT NULL CHECK (qty > 0),
  unit_cost NUMERIC(15, 2) NOT NULL DEFAULT 0
);

-- 9. PAYROLL (F-14 Payroll UMKM)
CREATE TABLE IF NOT EXISTS public.payrolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- Format: YYYY-MM
  base_salary NUMERIC(15, 2) NOT NULL DEFAULT 0,
  allowance NUMERIC(15, 2) DEFAULT 0,
  deduction NUMERIC(15, 2) DEFAULT 0,
  total_salary NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'dibayar')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTH TRIGGER: OTOMATIS BIKIN TENANT & USER SAAT SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_business_name TEXT;
  v_slug TEXT;
  v_is_employee BOOLEAN;
BEGIN
  -- 1. Check if this is an employee account being added to an existing tenant
  IF new.raw_user_meta_data->>'tenant_id' IS NOT NULL THEN
    v_tenant_id := (new.raw_user_meta_data->>'tenant_id')::UUID;
    
    INSERT INTO public.users (
      id, tenant_id, username, name, contact_email, phone, is_owner, template, permissions
    ) VALUES (
      new.id,
      v_tenant_id,
      COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
      COALESCE(new.raw_user_meta_data->>'name', SPLIT_PART(new.email, '@', 1)),
      new.email,
      new.raw_user_meta_data->>'phone',
      false,
      COALESCE(new.raw_user_meta_data->>'template', 'Karyawan'),
      COALESCE(
        (new.raw_user_meta_data->'permissions')::jsonb,
        '{
          "dashboard": "view",
          "penjualan": "view",
          "produk": "view",
          "stok": "view",
          "pengeluaran": "none",
          "pembayaran": "none",
          "pengiriman": "none",
          "pelanggan": "none",
          "laporan_keuangan": "none",
          "laporan_periodik": "none",
          "analitik": "none",
          "copilot": "none"
        }'::jsonb
      )
    );

    RETURN new;
  END IF;

  -- 2. Otherwise, this is a new UMKM Owner registration
  v_business_name := COALESCE(new.raw_user_meta_data->>'business_name', 'Toko Usaha Saya');
  v_slug := LOWER(REGEXP_REPLACE(v_business_name, '[^a-zA-Z0-9]+', '', 'g'));
  IF v_slug = '' THEN v_slug := 'usaha-' || SUBSTRING(new.id::TEXT, 1, 6); END IF;

  -- Create Tenant
  INSERT INTO public.tenants (name, slug, city, phone)
  VALUES (v_business_name, v_slug || '-' || SUBSTRING(new.id::TEXT, 1, 4), 'Bandung', COALESCE(new.raw_user_meta_data->>'phone', ''))
  RETURNING id INTO v_tenant_id;

  -- Create User as Owner with Full Access
  INSERT INTO public.users (
    id, tenant_id, username, name, contact_email, phone, is_owner, template, permissions
  ) VALUES (
    new.id,
    v_tenant_id,
    COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'name', SPLIT_PART(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    true,
    'Owner',
    '{
      "dashboard": "manage",
      "penjualan": "manage",
      "produk": "manage",
      "stok": "manage",
      "pengeluaran": "manage",
      "pembayaran": "manage",
      "pengiriman": "manage",
      "pelanggan": "manage",
      "laporan_keuangan": "manage",
      "laporan_periodik": "manage",
      "analitik": "manage",
      "copilot": "manage"
    }'::jsonb
  );

  -- 3. Seed Default Expense Categories for New Tenant
  INSERT INTO public.expense_categories (tenant_id, name, group_type, active, is_stock_related) VALUES
    (v_tenant_id, 'Belanja stok (masuk persediaan, bukan beban)', 'cogs', true, true),
    (v_tenant_id, 'Kemasan', 'cogs', true, false),
    (v_tenant_id, 'Iklan & Promosi', 'selling', true, false),
    (v_tenant_id, 'Ongkir Ditanggung Penjual', 'selling', true, false),
    (v_tenant_id, 'Sewa Tempat', 'operating', true, false),
    (v_tenant_id, 'Gaji & Upah', 'operating', true, false),
    (v_tenant_id, 'Listrik / Air / Internet', 'operating', true, false),
    (v_tenant_id, 'Transportasi', 'operating', true, false),
    (v_tenant_id, 'Biaya Admin Bank', 'other', true, false),
    (v_tenant_id, 'Lainnya', 'other', true, false),
    (v_tenant_id, 'Prive (Pengambilan Pribadi Pemilik)', 'non_expense', true, false);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ATOMIC BUSINESS LOGIC FUNCTIONS (RPC)
-- ============================================================

-- Function: Create Order + Order Items + Decrement Stock + Log Stock Movement in ONE Transaction
CREATE OR REPLACE FUNCTION public.fn_create_order_with_stock(
  p_tenant_id UUID,
  p_channel TEXT,
  p_customer_id UUID,
  p_subtotal NUMERIC,
  p_discount NUMERIC,
  p_admin_fee NUMERIC,
  p_shipping_cost NUMERIC,
  p_payment_status TEXT,
  p_shipment_status TEXT,
  p_due_date DATE,
  p_note TEXT,
  p_external_order_id TEXT,
  p_items JSONB -- Array of {productId, qty, unitPrice, cogsUnit}
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item RECORD;
  v_current_stock INT;
  v_track_stock BOOLEAN;
BEGIN
  -- 1. Insert Order
  INSERT INTO public.orders (
    tenant_id, channel, customer_id, subtotal, discount,
    admin_fee, shipping_cost, payment_status, shipment_status,
    due_date, note, external_order_id
  ) VALUES (
    p_tenant_id, p_channel, p_customer_id, p_subtotal, p_discount,
    p_admin_fee, p_shipping_cost, p_payment_status, p_shipment_status,
    p_due_date, p_note, p_external_order_id
  ) RETURNING id INTO v_order_id;

  -- 2. Process Items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    productId UUID, qty INT, unitPrice NUMERIC, cogsUnit NUMERIC
  ) LOOP
    INSERT INTO public.order_items (order_id, product_id, qty, unit_price, cogs_unit)
    VALUES (v_order_id, v_item.productId, v_item.qty, v_item.unitPrice, COALESCE(v_item.cogsUnit, 0));

    SELECT stock, track_stock INTO v_current_stock, v_track_stock
    FROM public.products
    WHERE id = v_item.productId AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF v_track_stock IS TRUE THEN
      UPDATE public.products
      SET stock = stock - v_item.qty,
          updated_at = NOW()
      WHERE id = v_item.productId;

      INSERT INTO public.stock_movements (
        tenant_id, product_id, type, qty, date, ref_id, note
      ) VALUES (
        p_tenant_id, v_item.productId, 'sale', -v_item.qty, CURRENT_DATE, v_order_id::TEXT, 'Penjualan #' || LEFT(v_order_id::TEXT, 8)
      );
    END IF;
  END LOOP;

  -- 3. If paid, create initial payment record
  IF p_payment_status = 'lunas' THEN
    INSERT INTO public.sale_payments (order_id, date, amount, note)
    VALUES (v_order_id, CURRENT_DATE, (p_subtotal - p_discount + p_shipping_cost), 'Pembayaran lunas');
  END IF;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Void Order + Restore Stock atomically
CREATE OR REPLACE FUNCTION public.fn_void_order(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
  v_tenant_id UUID;
  v_is_voided BOOLEAN;
BEGIN
  SELECT tenant_id, voided INTO v_tenant_id, v_is_voided
  FROM public.orders
  WHERE id = p_order_id FOR UPDATE;

  IF v_is_voided IS TRUE THEN
    RAISE EXCEPTION 'Order sudah dibatalkan sebelumnya';
  END IF;

  UPDATE public.orders
  SET voided = true, voided_at = NOW()
  WHERE id = p_order_id;

  FOR v_item IN
    SELECT product_id, qty FROM public.order_items WHERE order_id = p_order_id
  LOOP
    UPDATE public.products
    SET stock = stock + v_item.qty,
        updated_at = NOW()
    WHERE id = v_item.product_id;

    INSERT INTO public.stock_movements (
      tenant_id, product_id, type, qty, date, ref_id, note
    ) VALUES (
      v_tenant_id, v_item.product_id, 'adjustment', v_item.qty, CURRENT_DATE, p_order_id::TEXT, 'Pembatalan transaksi'
    );
  END LOOP;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Record Purchase with Stock & Moving Average Cost
CREATE OR REPLACE FUNCTION public.fn_record_purchase(
  p_tenant_id UUID,
  p_supplier_id UUID,
  p_product_id UUID,
  p_qty INT,
  p_buy_price NUMERIC,
  p_date DATE,
  p_paid BOOLEAN
)
RETURNS UUID AS $$
DECLARE
  v_purchase_id UUID;
  v_curr_stock INT;
  v_curr_avg_cost NUMERIC;
  v_new_avg_cost NUMERIC;
BEGIN
  INSERT INTO public.purchases (
    tenant_id, supplier_id, product_id, qty, buy_price, date, paid
  ) VALUES (
    p_tenant_id, p_supplier_id, p_product_id, p_qty, p_buy_price, p_date, p_paid
  ) RETURNING id INTO v_purchase_id;

  SELECT stock, avg_cost INTO v_curr_stock, v_curr_avg_cost
  FROM public.products
  WHERE id = p_product_id AND tenant_id = p_tenant_id
  FOR UPDATE;

  IF (COALESCE(v_curr_stock, 0) + p_qty) > 0 THEN
    v_new_avg_cost := ((COALESCE(v_curr_stock, 0) * COALESCE(v_curr_avg_cost, p_buy_price)) + (p_qty * p_buy_price)) / (COALESCE(v_curr_stock, 0) + p_qty);
  ELSE
    v_new_avg_cost := p_buy_price;
  END IF;

  UPDATE public.products
  SET stock = stock + p_qty,
      buy_price = p_buy_price,
      avg_cost = ROUND(v_new_avg_cost, 2),
      updated_at = NOW()
  WHERE id = p_product_id;

  INSERT INTO public.stock_movements (
    tenant_id, product_id, type, qty, date, ref_id, note
  ) VALUES (
    p_tenant_id, p_product_id, 'purchase', p_qty, p_date, v_purchase_id::TEXT, 'Pembelian stok'
  );

  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete employee completely from both public.users and auth.users
CREATE OR REPLACE FUNCTION public.fn_delete_employee(
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_target_id UUID := NULL;
BEGIN
  -- 1. Cari user ID target
  IF p_user_id IS NOT NULL THEN
    v_target_id := p_user_id;
  ELSIF p_email IS NOT NULL THEN
    SELECT id INTO v_target_id FROM auth.users WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
    IF v_target_id IS NULL THEN
      SELECT id INTO v_target_id FROM public.users WHERE LOWER(contact_email) = LOWER(p_email) LIMIT 1;
    END IF;
  ELSIF p_username IS NOT NULL THEN
    SELECT id INTO v_target_id FROM public.users WHERE LOWER(username) = LOWER(p_username) LIMIT 1;
  END IF;

  IF v_target_id IS NOT NULL THEN
    -- Mencegah penghapusan akun Owner
    IF EXISTS (SELECT 1 FROM public.users WHERE id = v_target_id AND is_owner IS TRUE) THEN
      RAISE EXCEPTION 'Tidak dapat menghapus akun Owner';
    END IF;

    -- Hapus dari public.users
    DELETE FROM public.users WHERE id = v_target_id AND is_owner IS NOT TRUE;

    -- Hapus dari auth.users (otomatis hilang dari dashboard Authentication)
    DELETE FROM auth.users WHERE id = v_target_id;

    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: When employee is deleted from public.users, automatically delete from auth.users
CREATE OR REPLACE FUNCTION public.on_employee_deleted_from_public()
RETURNS TRIGGER AS $$
BEGIN
  IF old.is_owner IS NOT TRUE THEN
    DELETE FROM auth.users WHERE id = old.id;
  END IF;
  RETURN old;
EXCEPTION
  WHEN OTHERS THEN
    RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_delete_auth_user ON public.users;
CREATE TRIGGER tr_delete_auth_user
  AFTER DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_employee_deleted_from_public();

-- ============================================================
-- RPC: UPDATE USER PROFILE & PASSWORD (AUTH + PUBLIC SYNC)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_update_user_profile(
  p_user_id UUID,
  p_name TEXT,
  p_username TEXT,
  p_new_password TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_clean_username TEXT;
BEGIN
  -- Bersihkan username
  v_clean_username := lower(regexp_replace(COALESCE(p_username, ''), '[^a-zA-Z0-9._@]', '', 'g'));

  -- 1. Update tabel public.users
  UPDATE public.users
  SET
    name = COALESCE(NULLIF(p_name, ''), name),
    username = COALESCE(NULLIF(v_clean_username, ''), username)
  WHERE id = p_user_id;

  -- 2. Update auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_strip_nulls(jsonb_build_object(
      'name', NULLIF(p_name, ''),
      'username', NULLIF(v_clean_username, '')
    ))
  WHERE id = p_user_id;

  -- 3. Jika ada kata sandi baru, hash dengan blowfish dan perbarui auth.users
  IF p_new_password IS NOT NULL AND length(p_new_password) >= 6 THEN
    UPDATE auth.users
    SET encrypted_password = crypt(p_new_password, gen_salt('bf'))
    WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.fn_update_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;


-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Tenants
DROP POLICY IF EXISTS tenant_isolation_tenants ON public.tenants;
CREATE POLICY tenant_isolation_tenants ON public.tenants
  FOR ALL USING (id = public.get_auth_tenant_id() OR public.get_auth_tenant_id() IS NULL);

-- Users (Allow user to read and modify their own record OR tenant owner to manage all tenant members)
DROP POLICY IF EXISTS tenant_isolation_users_select ON public.users;
CREATE POLICY tenant_isolation_users_select ON public.users
  FOR SELECT USING (id = auth.uid() OR tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_users_modify ON public.users;
CREATE POLICY tenant_isolation_users_modify ON public.users
  FOR ALL USING (id = auth.uid() OR (tenant_id = public.get_auth_tenant_id() AND public.is_auth_owner()));

-- Products
DROP POLICY IF EXISTS tenant_isolation_products ON public.products;
CREATE POLICY tenant_isolation_products ON public.products
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Stock Movements
DROP POLICY IF EXISTS tenant_isolation_stock ON public.stock_movements;
CREATE POLICY tenant_isolation_stock ON public.stock_movements
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Customers & Suppliers
DROP POLICY IF EXISTS tenant_isolation_customers ON public.customers;
CREATE POLICY tenant_isolation_customers ON public.customers
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_suppliers ON public.suppliers;
CREATE POLICY tenant_isolation_suppliers ON public.suppliers
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Orders
DROP POLICY IF EXISTS tenant_isolation_orders ON public.orders;
CREATE POLICY tenant_isolation_orders ON public.orders
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Order Items
DROP POLICY IF EXISTS tenant_isolation_order_items ON public.order_items;
CREATE POLICY tenant_isolation_order_items ON public.order_items
  FOR ALL USING (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_auth_tenant_id())
  );

-- Sale Payments
DROP POLICY IF EXISTS tenant_isolation_sale_payments ON public.sale_payments;
CREATE POLICY tenant_isolation_sale_payments ON public.sale_payments
  FOR ALL USING (
    order_id IN (SELECT id FROM public.orders WHERE tenant_id = public.get_auth_tenant_id())
  );

-- Purchases
DROP POLICY IF EXISTS tenant_isolation_purchases ON public.purchases;
CREATE POLICY tenant_isolation_purchases ON public.purchases
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Expense Categories
DROP POLICY IF EXISTS tenant_isolation_expense_categories ON public.expense_categories;
CREATE POLICY tenant_isolation_expense_categories ON public.expense_categories
  FOR ALL USING (tenant_id IS NULL OR tenant_id = public.get_auth_tenant_id());

-- Expenses & Items
DROP POLICY IF EXISTS tenant_isolation_expenses ON public.expenses;
CREATE POLICY tenant_isolation_expenses ON public.expenses
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_expense_items ON public.expense_items;
CREATE POLICY tenant_isolation_expense_items ON public.expense_items
  FOR ALL USING (
    expense_id IN (SELECT id FROM public.expenses WHERE tenant_id = public.get_auth_tenant_id())
  );

-- Payrolls
DROP POLICY IF EXISTS tenant_isolation_payrolls ON public.payrolls;
CREATE POLICY tenant_isolation_payrolls ON public.payrolls
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Activity Logs
DROP POLICY IF EXISTS tenant_isolation_activity_logs ON public.activity_logs;
CREATE POLICY tenant_isolation_activity_logs ON public.activity_logs
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());
