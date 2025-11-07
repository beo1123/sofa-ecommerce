--
-- PostgreSQL database dump
--

\restrict ZeawJUg1Q7UGZwcO6PNJ8WQbdBSolVuNmTb1jV9KymkZFx2lc5uYyMlEq7vWJ5X

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: CouponType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CouponType" AS ENUM (
    'PERCENT',
    'FIXED',
    'BOGO'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'CREATED',
    'PENDING_PAYMENT',
    'PAID',
    'FAILED_PAYMENT',
    'COD_PENDING',
    'COD_COMPLETED',
    'FULFILLED',
    'CANCELLED',
    'REFUNDED'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'VNPAY',
    'COD',
    'WALLET',
    'OTHER'
);


--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


--
-- Name: RefundStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RefundStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED'
);


--
-- Name: ReturnStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReturnStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'RECEIVED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Address" (
    id integer NOT NULL,
    "userId" integer,
    "fullName" text NOT NULL,
    line1 text NOT NULL,
    line2 text,
    city text NOT NULL,
    province text,
    "postalCode" text,
    country text NOT NULL,
    phone text,
    metadata jsonb,
    "isDefaultShipping" boolean DEFAULT false NOT NULL,
    "isDefaultBilling" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Address_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Address_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Address_id_seq" OWNED BY public."Address".id;


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id integer NOT NULL,
    "actorId" integer,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    changes jsonb,
    ip text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AuditLog_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."AuditLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AuditLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."AuditLog_id_seq" OWNED BY public."AuditLog".id;


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Coupon" (
    id integer NOT NULL,
    code text NOT NULL,
    type public."CouponType" NOT NULL,
    amount numeric(12,2),
    percent integer,
    description text,
    "startsAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "usageLimit" integer,
    "usagePerUser" integer,
    "timesUsed" integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Coupon_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Coupon_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Coupon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Coupon_id_seq" OWNED BY public."Coupon".id;


--
-- Name: Inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Inventory" (
    id integer NOT NULL,
    sku text NOT NULL,
    "variantId" integer NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    reserved integer DEFAULT 0 NOT NULL,
    location text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Inventory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Inventory_id_seq" OWNED BY public."Inventory".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" integer,
    "shippingAddressId" integer,
    "billingAddressId" integer,
    "recipientName" text NOT NULL,
    phone text NOT NULL,
    email text,
    line1 text NOT NULL,
    city text DEFAULT 'TPHCM'::text NOT NULL,
    province text NOT NULL,
    country text DEFAULT 'Việt Nam'::text NOT NULL,
    status public."OrderStatus" DEFAULT 'CREATED'::public."OrderStatus" NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    shipping numeric(12,2) DEFAULT 0 NOT NULL,
    tax numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) NOT NULL,
    "paymentMethod" public."PaymentMethod" NOT NULL,
    "couponId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "productId" integer,
    "variantId" integer,
    sku text,
    name text NOT NULL,
    price numeric(12,2) NOT NULL,
    quantity integer NOT NULL,
    total numeric(12,2) NOT NULL,
    returned boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;


--
-- Name: OrderStatusHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderStatusHistory" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "fromStatus" public."OrderStatus",
    "toStatus" public."OrderStatus" NOT NULL,
    note text,
    "actorId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: OrderStatusHistory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OrderStatusHistory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OrderStatusHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OrderStatusHistory_id_seq" OWNED BY public."OrderStatusHistory".id;


--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: PaymentMeta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PaymentMeta" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    provider text NOT NULL,
    "transactionId" text,
    status text NOT NULL,
    amount numeric(12,2) NOT NULL,
    raw jsonb,
    "capturedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PaymentMeta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."PaymentMeta_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: PaymentMeta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."PaymentMeta_id_seq" OWNED BY public."PaymentMeta".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Product" (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    "shortDescription" text,
    description text,
    status public."ProductStatus" DEFAULT 'PUBLISHED'::public."ProductStatus" NOT NULL,
    metadata jsonb,
    "categoryId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductImage" (
    id integer NOT NULL,
    url text NOT NULL,
    alt text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "productId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProductImage_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ProductImage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ProductImage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ProductImage_id_seq" OWNED BY public."ProductImage".id;


--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductVariant" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    name text NOT NULL,
    "skuPrefix" text,
    price numeric(12,2) NOT NULL,
    "compareAtPrice" numeric(12,2),
    attributes jsonb,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProductVariant_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ProductVariant_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ProductVariant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ProductVariant_id_seq" OWNED BY public."ProductVariant".id;


--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: Refund; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Refund" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "returnRequestId" integer,
    amount numeric(12,2) NOT NULL,
    method text NOT NULL,
    status public."RefundStatus" DEFAULT 'PENDING'::public."RefundStatus" NOT NULL,
    "providerRef" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone
);


--
-- Name: Refund_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Refund_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Refund_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Refund_id_seq" OWNED BY public."Refund".id;


--
-- Name: ReturnRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReturnRequest" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "orderItemId" integer NOT NULL,
    reason text NOT NULL,
    status public."ReturnStatus" DEFAULT 'PENDING'::public."ReturnStatus" NOT NULL,
    evidence jsonb,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone,
    metadata jsonb
);


--
-- Name: ReturnRequest_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ReturnRequest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ReturnRequest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ReturnRequest_id_seq" OWNED BY public."ReturnRequest".id;


--
-- Name: Review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Review" (
    id integer NOT NULL,
    "userId" integer,
    "productId" integer NOT NULL,
    rating integer NOT NULL,
    title text,
    body text,
    approved boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Review_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Review_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Review_id_seq" OWNED BY public."Review".id;


--
-- Name: Role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Role" (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: Role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Role_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Role_id_seq" OWNED BY public."Role".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    username text,
    password text,
    "displayName" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastLogin" timestamp(3) without time zone
);


--
-- Name: UserRole; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserRole" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "roleId" integer NOT NULL
);


--
-- Name: UserRole_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."UserRole_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserRole_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."UserRole_id_seq" OWNED BY public."UserRole".id;


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: Wishlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Wishlist" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: WishlistItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WishlistItem" (
    id integer NOT NULL,
    "wishlistId" integer NOT NULL,
    "productId" integer NOT NULL,
    "variantId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: WishlistItem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."WishlistItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: WishlistItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."WishlistItem_id_seq" OWNED BY public."WishlistItem".id;


--
-- Name: Wishlist_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Wishlist_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Wishlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Wishlist_id_seq" OWNED BY public."Wishlist".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: Address id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Address" ALTER COLUMN id SET DEFAULT nextval('public."Address_id_seq"'::regclass);


--
-- Name: AuditLog id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog" ALTER COLUMN id SET DEFAULT nextval('public."AuditLog_id_seq"'::regclass);


--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: Coupon id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupon" ALTER COLUMN id SET DEFAULT nextval('public."Coupon_id_seq"'::regclass);


--
-- Name: Inventory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory" ALTER COLUMN id SET DEFAULT nextval('public."Inventory_id_seq"'::regclass);


--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: OrderItem id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);


--
-- Name: OrderStatusHistory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory" ALTER COLUMN id SET DEFAULT nextval('public."OrderStatusHistory_id_seq"'::regclass);


--
-- Name: PaymentMeta id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentMeta" ALTER COLUMN id SET DEFAULT nextval('public."PaymentMeta_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: ProductImage id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductImage" ALTER COLUMN id SET DEFAULT nextval('public."ProductImage_id_seq"'::regclass);


--
-- Name: ProductVariant id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductVariant" ALTER COLUMN id SET DEFAULT nextval('public."ProductVariant_id_seq"'::regclass);


--
-- Name: Refund id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Refund" ALTER COLUMN id SET DEFAULT nextval('public."Refund_id_seq"'::regclass);


--
-- Name: ReturnRequest id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReturnRequest" ALTER COLUMN id SET DEFAULT nextval('public."ReturnRequest_id_seq"'::regclass);


--
-- Name: Review id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review" ALTER COLUMN id SET DEFAULT nextval('public."Review_id_seq"'::regclass);


--
-- Name: Role id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role" ALTER COLUMN id SET DEFAULT nextval('public."Role_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: UserRole id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole" ALTER COLUMN id SET DEFAULT nextval('public."UserRole_id_seq"'::regclass);


--
-- Name: Wishlist id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist" ALTER COLUMN id SET DEFAULT nextval('public."Wishlist_id_seq"'::regclass);


--
-- Name: WishlistItem id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WishlistItem" ALTER COLUMN id SET DEFAULT nextval('public."WishlistItem_id_seq"'::regclass);


--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Address" (id, "userId", "fullName", line1, line2, city, province, "postalCode", country, phone, metadata, "isDefaultShipping", "isDefaultBilling", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "actorId", action, entity, "entityId", changes, ip, "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, name, slug, "createdAt", "updatedAt") FROM stdin;
1	Sofa da	sofa-da	2025-11-07 03:51:36.532	2025-11-07 03:51:36.532
2	Sofa vải nỉ	sofa-vai-ni	2025-11-07 03:51:36.536	2025-11-07 03:51:36.536
3	Sofa góc	sofa-goc	2025-11-07 03:51:36.539	2025-11-07 03:51:36.539
4	Sofa đơn	sofa-don	2025-11-07 03:51:36.542	2025-11-07 03:51:36.542
5	Sofa giường	sofa-giuong	2025-11-07 03:51:36.544	2025-11-07 03:51:36.544
6	Sofa thư giãn	sofa-thu-gian	2025-11-07 03:51:36.546	2025-11-07 03:51:36.546
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Coupon" (id, code, type, amount, percent, description, "startsAt", "expiresAt", "usageLimit", "usagePerUser", "timesUsed", active, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Inventory" (id, sku, "variantId", quantity, reserved, location, metadata, "createdAt", "updatedAt") FROM stdin;
1	SKU-1-1	1	30	0	\N	\N	2025-11-07 03:51:36.557	2025-11-07 03:51:36.557
2	SKU-1-2	2	41	3	\N	\N	2025-11-07 03:51:36.567	2025-11-07 03:51:36.567
3	SKU-2-1	3	39	3	\N	\N	2025-11-07 03:51:36.578	2025-11-07 03:51:36.578
4	SKU-2-2	4	30	2	\N	\N	2025-11-07 03:51:36.584	2025-11-07 03:51:36.584
5	SKU-2-3	5	24	3	\N	\N	2025-11-07 03:51:36.591	2025-11-07 03:51:36.591
6	SKU-3-1	6	22	0	\N	\N	2025-11-07 03:51:36.599	2025-11-07 03:51:36.599
7	SKU-3-2	7	20	4	\N	\N	2025-11-07 03:51:36.605	2025-11-07 03:51:36.605
8	SKU-3-3	8	28	4	\N	\N	2025-11-07 03:51:36.611	2025-11-07 03:51:36.611
9	SKU-4-1	9	44	3	\N	\N	2025-11-07 03:51:36.62	2025-11-07 03:51:36.62
10	SKU-4-2	10	29	3	\N	\N	2025-11-07 03:51:36.626	2025-11-07 03:51:36.626
11	SKU-4-3	11	39	0	\N	\N	2025-11-07 03:51:36.631	2025-11-07 03:51:36.631
12	SKU-5-1	12	25	1	\N	\N	2025-11-07 03:51:36.64	2025-11-07 03:51:36.64
13	SKU-5-2	13	48	0	\N	\N	2025-11-07 03:51:36.645	2025-11-07 03:51:36.645
14	SKU-5-3	14	21	2	\N	\N	2025-11-07 03:51:36.651	2025-11-07 03:51:36.651
15	SKU-6-1	15	24	1	\N	\N	2025-11-07 03:51:36.659	2025-11-07 03:51:36.659
16	SKU-6-2	16	26	2	\N	\N	2025-11-07 03:51:36.665	2025-11-07 03:51:36.665
17	SKU-7-1	17	44	3	\N	\N	2025-11-07 03:51:36.673	2025-11-07 03:51:36.673
18	SKU-7-2	18	32	4	\N	\N	2025-11-07 03:51:36.679	2025-11-07 03:51:36.679
19	SKU-7-3	19	42	3	\N	\N	2025-11-07 03:51:36.684	2025-11-07 03:51:36.684
20	SKU-8-1	20	34	0	\N	\N	2025-11-07 03:51:36.692	2025-11-07 03:51:36.692
21	SKU-8-2	21	39	0	\N	\N	2025-11-07 03:51:36.697	2025-11-07 03:51:36.697
22	SKU-9-1	22	21	0	\N	\N	2025-11-07 03:51:36.706	2025-11-07 03:51:36.706
23	SKU-9-2	23	45	4	\N	\N	2025-11-07 03:51:36.711	2025-11-07 03:51:36.711
24	SKU-9-3	24	38	2	\N	\N	2025-11-07 03:51:36.717	2025-11-07 03:51:36.717
25	SKU-10-1	25	37	2	\N	\N	2025-11-07 03:51:36.726	2025-11-07 03:51:36.726
26	SKU-10-2	26	20	2	\N	\N	2025-11-07 03:51:36.731	2025-11-07 03:51:36.731
27	SKU-11-1	27	40	0	\N	\N	2025-11-07 03:51:36.741	2025-11-07 03:51:36.741
28	SKU-11-2	28	36	4	\N	\N	2025-11-07 03:51:36.747	2025-11-07 03:51:36.747
29	SKU-12-1	29	21	1	\N	\N	2025-11-07 03:51:36.755	2025-11-07 03:51:36.755
30	SKU-12-2	30	46	4	\N	\N	2025-11-07 03:51:36.761	2025-11-07 03:51:36.761
31	SKU-13-1	31	41	0	\N	\N	2025-11-07 03:51:36.769	2025-11-07 03:51:36.769
32	SKU-13-2	32	47	0	\N	\N	2025-11-07 03:51:36.774	2025-11-07 03:51:36.774
33	SKU-14-1	33	37	3	\N	\N	2025-11-07 03:51:36.782	2025-11-07 03:51:36.782
34	SKU-14-2	34	20	3	\N	\N	2025-11-07 03:51:36.788	2025-11-07 03:51:36.788
35	SKU-14-3	35	28	0	\N	\N	2025-11-07 03:51:36.793	2025-11-07 03:51:36.793
36	SKU-15-1	36	39	3	\N	\N	2025-11-07 03:51:36.802	2025-11-07 03:51:36.802
37	SKU-15-2	37	31	0	\N	\N	2025-11-07 03:51:36.807	2025-11-07 03:51:36.807
38	SKU-16-1	38	46	4	\N	\N	2025-11-07 03:51:36.816	2025-11-07 03:51:36.816
39	SKU-16-2	39	30	4	\N	\N	2025-11-07 03:51:36.821	2025-11-07 03:51:36.821
40	SKU-16-3	40	20	1	\N	\N	2025-11-07 03:51:36.828	2025-11-07 03:51:36.828
41	SKU-17-1	41	30	3	\N	\N	2025-11-07 03:51:36.837	2025-11-07 03:51:36.837
42	SKU-17-2	42	29	1	\N	\N	2025-11-07 03:51:36.843	2025-11-07 03:51:36.843
43	SKU-18-1	43	20	0	\N	\N	2025-11-07 03:51:36.851	2025-11-07 03:51:36.851
44	SKU-18-2	44	32	2	\N	\N	2025-11-07 03:51:36.857	2025-11-07 03:51:36.857
45	SKU-18-3	45	23	1	\N	\N	2025-11-07 03:51:36.863	2025-11-07 03:51:36.863
46	SKU-19-1	46	38	3	\N	\N	2025-11-07 03:51:36.871	2025-11-07 03:51:36.871
47	SKU-19-2	47	47	0	\N	\N	2025-11-07 03:51:36.877	2025-11-07 03:51:36.877
48	SKU-20-1	48	40	0	\N	\N	2025-11-07 03:51:36.885	2025-11-07 03:51:36.885
49	SKU-20-2	49	41	1	\N	\N	2025-11-07 03:51:36.891	2025-11-07 03:51:36.891
50	SKU-21-1	50	30	0	\N	\N	2025-11-07 03:51:36.899	2025-11-07 03:51:36.899
51	SKU-21-2	51	37	3	\N	\N	2025-11-07 03:51:36.904	2025-11-07 03:51:36.904
52	SKU-21-3	52	24	3	\N	\N	2025-11-07 03:51:36.91	2025-11-07 03:51:36.91
53	SKU-22-1	53	32	1	\N	\N	2025-11-07 03:51:36.918	2025-11-07 03:51:36.918
54	SKU-22-2	54	37	0	\N	\N	2025-11-07 03:51:36.924	2025-11-07 03:51:36.924
55	SKU-22-3	55	25	3	\N	\N	2025-11-07 03:51:36.929	2025-11-07 03:51:36.929
56	SKU-23-1	56	20	2	\N	\N	2025-11-07 03:51:36.938	2025-11-07 03:51:36.938
57	SKU-23-2	57	42	0	\N	\N	2025-11-07 03:51:36.943	2025-11-07 03:51:36.943
58	SKU-24-1	58	46	2	\N	\N	2025-11-07 03:51:36.952	2025-11-07 03:51:36.952
59	SKU-24-2	59	41	1	\N	\N	2025-11-07 03:51:36.957	2025-11-07 03:51:36.957
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, "orderNumber", "userId", "shippingAddressId", "billingAddressId", "recipientName", phone, email, line1, city, province, country, status, subtotal, shipping, tax, total, "paymentMethod", "couponId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItem" (id, "orderId", "productId", "variantId", sku, name, price, quantity, total, returned, "createdAt") FROM stdin;
\.


--
-- Data for Name: OrderStatusHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderStatusHistory" (id, "orderId", "fromStatus", "toStatus", note, "actorId", "createdAt") FROM stdin;
\.


--
-- Data for Name: PaymentMeta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PaymentMeta" (id, "orderId", provider, "transactionId", status, amount, raw, "capturedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Product" (id, title, slug, "shortDescription", description, status, metadata, "categoryId", "createdAt", "updatedAt") FROM stdin;
1	Sofa da mẫu 1	sofa-da-mau-1	Mẫu 1 của sofa-da, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa da mẫu 1 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	1	2025-11-07 03:51:36.549	2025-11-07 03:51:36.549
2	Sofa da mẫu 2	sofa-da-mau-2	Mẫu 2 của sofa-da, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa da mẫu 2 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	1	2025-11-07 03:51:36.572	2025-11-07 03:51:36.572
3	Sofa da mẫu 3	sofa-da-mau-3	Mẫu 3 của sofa-da, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa da mẫu 3 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	1	2025-11-07 03:51:36.595	2025-11-07 03:51:36.595
4	Sofa da mẫu 4	sofa-da-mau-4	Mẫu 4 của sofa-da, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa da mẫu 4 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	1	2025-11-07 03:51:36.615	2025-11-07 03:51:36.615
5	Sofa vải nỉ mẫu 1	sofa-vai-ni-mau-1	Mẫu 1 của sofa-vai-ni, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa vải nỉ mẫu 1 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	2	2025-11-07 03:51:36.635	2025-11-07 03:51:36.635
6	Sofa vải nỉ mẫu 2	sofa-vai-ni-mau-2	Mẫu 2 của sofa-vai-ni, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa vải nỉ mẫu 2 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	2	2025-11-07 03:51:36.655	2025-11-07 03:51:36.655
7	Sofa vải nỉ mẫu 3	sofa-vai-ni-mau-3	Mẫu 3 của sofa-vai-ni, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa vải nỉ mẫu 3 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	2	2025-11-07 03:51:36.669	2025-11-07 03:51:36.669
8	Sofa vải nỉ mẫu 4	sofa-vai-ni-mau-4	Mẫu 4 của sofa-vai-ni, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa vải nỉ mẫu 4 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	2	2025-11-07 03:51:36.688	2025-11-07 03:51:36.688
9	Sofa góc mẫu 1	sofa-goc-mau-1	Mẫu 1 của sofa-goc, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa góc mẫu 1 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	3	2025-11-07 03:51:36.702	2025-11-07 03:51:36.702
10	Sofa góc mẫu 2	sofa-goc-mau-2	Mẫu 2 của sofa-goc, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa góc mẫu 2 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	3	2025-11-07 03:51:36.721	2025-11-07 03:51:36.721
11	Sofa góc mẫu 3	sofa-goc-mau-3	Mẫu 3 của sofa-goc, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa góc mẫu 3 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	3	2025-11-07 03:51:36.735	2025-11-07 03:51:36.735
12	Sofa góc mẫu 4	sofa-goc-mau-4	Mẫu 4 của sofa-goc, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa góc mẫu 4 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	3	2025-11-07 03:51:36.751	2025-11-07 03:51:36.751
13	Sofa đơn mẫu 1	sofa-don-mau-1	Mẫu 1 của sofa-don, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa đơn mẫu 1 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	4	2025-11-07 03:51:36.765	2025-11-07 03:51:36.765
14	Sofa đơn mẫu 2	sofa-don-mau-2	Mẫu 2 của sofa-don, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa đơn mẫu 2 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	4	2025-11-07 03:51:36.778	2025-11-07 03:51:36.778
15	Sofa đơn mẫu 3	sofa-don-mau-3	Mẫu 3 của sofa-don, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa đơn mẫu 3 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	4	2025-11-07 03:51:36.797	2025-11-07 03:51:36.797
16	Sofa đơn mẫu 4	sofa-don-mau-4	Mẫu 4 của sofa-don, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa đơn mẫu 4 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	4	2025-11-07 03:51:36.811	2025-11-07 03:51:36.811
17	Sofa giường mẫu 1	sofa-giuong-mau-1	Mẫu 1 của sofa-giuong, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa giường mẫu 1 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	5	2025-11-07 03:51:36.833	2025-11-07 03:51:36.833
18	Sofa giường mẫu 2	sofa-giuong-mau-2	Mẫu 2 của sofa-giuong, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa giường mẫu 2 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	5	2025-11-07 03:51:36.847	2025-11-07 03:51:36.847
19	Sofa giường mẫu 3	sofa-giuong-mau-3	Mẫu 3 của sofa-giuong, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa giường mẫu 3 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	5	2025-11-07 03:51:36.867	2025-11-07 03:51:36.867
20	Sofa giường mẫu 4	sofa-giuong-mau-4	Mẫu 4 của sofa-giuong, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa giường mẫu 4 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	5	2025-11-07 03:51:36.881	2025-11-07 03:51:36.881
21	Sofa thư giãn mẫu 1	sofa-thu-gian-mau-1	Mẫu 1 của sofa-thu-gian, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa thư giãn mẫu 1 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	6	2025-11-07 03:51:36.895	2025-11-07 03:51:36.895
22	Sofa thư giãn mẫu 2	sofa-thu-gian-mau-2	Mẫu 2 của sofa-thu-gian, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa thư giãn mẫu 2 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	6	2025-11-07 03:51:36.914	2025-11-07 03:51:36.914
23	Sofa thư giãn mẫu 3	sofa-thu-gian-mau-3	Mẫu 3 của sofa-thu-gian, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa thư giãn mẫu 3 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	6	2025-11-07 03:51:36.934	2025-11-07 03:51:36.934
24	Sofa thư giãn mẫu 4	sofa-thu-gian-mau-4	Mẫu 4 của sofa-thu-gian, thiết kế hiện đại và sang trọng.	Sản phẩm Sofa thư giãn mẫu 4 được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.	PUBLISHED	\N	6	2025-11-07 03:51:36.948	2025-11-07 03:51:36.948
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductImage" (id, url, alt, "isPrimary", "productId", "createdAt", "updatedAt") FROM stdin;
1	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.4307030581739788	Sofa da mẫu 1 - ảnh 1	t	1	2025-11-07 03:51:36.56	2025-11-07 03:51:36.56
2	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.013708383137999158	Sofa da mẫu 1 - ảnh 2	f	1	2025-11-07 03:51:36.562	2025-11-07 03:51:36.562
3	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.5829314669549233	Sofa da mẫu 1 - ảnh 1	t	1	2025-11-07 03:51:36.569	2025-11-07 03:51:36.569
4	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.43879286643837734	Sofa da mẫu 1 - ảnh 2	f	1	2025-11-07 03:51:36.57	2025-11-07 03:51:36.57
5	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.3903235767249873	Sofa da mẫu 2 - ảnh 1	t	2	2025-11-07 03:51:36.579	2025-11-07 03:51:36.579
6	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.40197202202793925	Sofa da mẫu 2 - ảnh 2	f	2	2025-11-07 03:51:36.581	2025-11-07 03:51:36.581
7	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.22156917914428576	Sofa da mẫu 2 - ảnh 1	t	2	2025-11-07 03:51:36.586	2025-11-07 03:51:36.586
8	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.9453195757129769	Sofa da mẫu 2 - ảnh 2	f	2	2025-11-07 03:51:36.588	2025-11-07 03:51:36.588
9	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.24468344975409995	Sofa da mẫu 2 - ảnh 1	t	2	2025-11-07 03:51:36.592	2025-11-07 03:51:36.592
10	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.6903362360111751	Sofa da mẫu 2 - ảnh 2	f	2	2025-11-07 03:51:36.593	2025-11-07 03:51:36.593
11	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.6019780171777345	Sofa da mẫu 3 - ảnh 1	t	3	2025-11-07 03:51:36.601	2025-11-07 03:51:36.601
12	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.5971895536611462	Sofa da mẫu 3 - ảnh 2	f	3	2025-11-07 03:51:36.602	2025-11-07 03:51:36.602
13	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.8184550041741285	Sofa da mẫu 3 - ảnh 1	t	3	2025-11-07 03:51:36.607	2025-11-07 03:51:36.607
14	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.1549174867085643	Sofa da mẫu 3 - ảnh 2	f	3	2025-11-07 03:51:36.608	2025-11-07 03:51:36.608
15	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.24444503198352407	Sofa da mẫu 3 - ảnh 1	t	3	2025-11-07 03:51:36.613	2025-11-07 03:51:36.613
16	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.09694646167106535	Sofa da mẫu 3 - ảnh 2	f	3	2025-11-07 03:51:36.614	2025-11-07 03:51:36.614
17	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.5404891183191329	Sofa da mẫu 4 - ảnh 1	t	4	2025-11-07 03:51:36.621	2025-11-07 03:51:36.621
18	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.38986497530818576	Sofa da mẫu 4 - ảnh 2	f	4	2025-11-07 03:51:36.623	2025-11-07 03:51:36.623
19	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.11983472903393144	Sofa da mẫu 4 - ảnh 1	t	4	2025-11-07 03:51:36.627	2025-11-07 03:51:36.627
20	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.027334791604431752	Sofa da mẫu 4 - ảnh 2	f	4	2025-11-07 03:51:36.629	2025-11-07 03:51:36.629
21	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.11052925979880923	Sofa da mẫu 4 - ảnh 1	t	4	2025-11-07 03:51:36.633	2025-11-07 03:51:36.633
22	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.5744504445237326	Sofa da mẫu 4 - ảnh 2	f	4	2025-11-07 03:51:36.634	2025-11-07 03:51:36.634
23	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.9123671736964396	Sofa vải nỉ mẫu 1 - ảnh 1	t	5	2025-11-07 03:51:36.641	2025-11-07 03:51:36.641
24	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.8388321946100803	Sofa vải nỉ mẫu 1 - ảnh 2	f	5	2025-11-07 03:51:36.642	2025-11-07 03:51:36.642
25	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.12304912989179417	Sofa vải nỉ mẫu 1 - ảnh 1	t	5	2025-11-07 03:51:36.647	2025-11-07 03:51:36.647
26	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.9759495122816217	Sofa vải nỉ mẫu 1 - ảnh 2	f	5	2025-11-07 03:51:36.648	2025-11-07 03:51:36.648
27	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.6681158346027827	Sofa vải nỉ mẫu 1 - ảnh 1	t	5	2025-11-07 03:51:36.652	2025-11-07 03:51:36.652
28	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.5721243983130047	Sofa vải nỉ mẫu 1 - ảnh 2	f	5	2025-11-07 03:51:36.654	2025-11-07 03:51:36.654
29	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.16202680696683425	Sofa vải nỉ mẫu 2 - ảnh 1	t	6	2025-11-07 03:51:36.661	2025-11-07 03:51:36.661
30	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.4809575144236682	Sofa vải nỉ mẫu 2 - ảnh 2	f	6	2025-11-07 03:51:36.662	2025-11-07 03:51:36.662
31	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.10797032311543009	Sofa vải nỉ mẫu 2 - ảnh 1	t	6	2025-11-07 03:51:36.666	2025-11-07 03:51:36.666
32	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.5876622299875767	Sofa vải nỉ mẫu 2 - ảnh 2	f	6	2025-11-07 03:51:36.667	2025-11-07 03:51:36.667
33	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.8222951564634626	Sofa vải nỉ mẫu 3 - ảnh 1	t	7	2025-11-07 03:51:36.674	2025-11-07 03:51:36.674
34	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.12819281650010383	Sofa vải nỉ mẫu 3 - ảnh 2	f	7	2025-11-07 03:51:36.676	2025-11-07 03:51:36.676
35	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.7462924782501712	Sofa vải nỉ mẫu 3 - ảnh 1	t	7	2025-11-07 03:51:36.68	2025-11-07 03:51:36.68
36	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.07285493177042612	Sofa vải nỉ mẫu 3 - ảnh 2	f	7	2025-11-07 03:51:36.681	2025-11-07 03:51:36.681
37	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.3014381174691716	Sofa vải nỉ mẫu 3 - ảnh 1	t	7	2025-11-07 03:51:36.685	2025-11-07 03:51:36.685
38	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.8216969187363772	Sofa vải nỉ mẫu 3 - ảnh 2	f	7	2025-11-07 03:51:36.687	2025-11-07 03:51:36.687
39	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.913023774080157	Sofa vải nỉ mẫu 4 - ảnh 1	t	8	2025-11-07 03:51:36.693	2025-11-07 03:51:36.693
40	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.7767609607905439	Sofa vải nỉ mẫu 4 - ảnh 2	f	8	2025-11-07 03:51:36.695	2025-11-07 03:51:36.695
41	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.5718583098197221	Sofa vải nỉ mẫu 4 - ảnh 1	t	8	2025-11-07 03:51:36.699	2025-11-07 03:51:36.699
42	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.7344845720276405	Sofa vải nỉ mẫu 4 - ảnh 2	f	8	2025-11-07 03:51:36.7	2025-11-07 03:51:36.7
43	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.5686303025185386	Sofa góc mẫu 1 - ảnh 1	t	9	2025-11-07 03:51:36.707	2025-11-07 03:51:36.707
44	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.7268092632673597	Sofa góc mẫu 1 - ảnh 2	f	9	2025-11-07 03:51:36.708	2025-11-07 03:51:36.708
45	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.07172037379237817	Sofa góc mẫu 1 - ảnh 1	t	9	2025-11-07 03:51:36.713	2025-11-07 03:51:36.713
46	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.27469617438363003	Sofa góc mẫu 1 - ảnh 2	f	9	2025-11-07 03:51:36.714	2025-11-07 03:51:36.714
47	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.6720846145241715	Sofa góc mẫu 1 - ảnh 1	t	9	2025-11-07 03:51:36.719	2025-11-07 03:51:36.719
48	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.7197965946117038	Sofa góc mẫu 1 - ảnh 2	f	9	2025-11-07 03:51:36.72	2025-11-07 03:51:36.72
49	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.6756982504715034	Sofa góc mẫu 2 - ảnh 1	t	10	2025-11-07 03:51:36.727	2025-11-07 03:51:36.727
50	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.4938302428972723	Sofa góc mẫu 2 - ảnh 2	f	10	2025-11-07 03:51:36.729	2025-11-07 03:51:36.729
51	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.765735546579605	Sofa góc mẫu 2 - ảnh 1	t	10	2025-11-07 03:51:36.732	2025-11-07 03:51:36.732
52	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.2780079942466256	Sofa góc mẫu 2 - ảnh 2	f	10	2025-11-07 03:51:36.734	2025-11-07 03:51:36.734
53	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.6722778141243386	Sofa góc mẫu 3 - ảnh 1	t	11	2025-11-07 03:51:36.743	2025-11-07 03:51:36.743
54	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.643616201205067	Sofa góc mẫu 3 - ảnh 2	f	11	2025-11-07 03:51:36.744	2025-11-07 03:51:36.744
55	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.954385112357875	Sofa góc mẫu 3 - ảnh 1	t	11	2025-11-07 03:51:36.748	2025-11-07 03:51:36.748
56	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.14141729344231724	Sofa góc mẫu 3 - ảnh 2	f	11	2025-11-07 03:51:36.75	2025-11-07 03:51:36.75
57	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.40841452438716774	Sofa góc mẫu 4 - ảnh 1	t	12	2025-11-07 03:51:36.757	2025-11-07 03:51:36.757
58	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.6391439398891077	Sofa góc mẫu 4 - ảnh 2	f	12	2025-11-07 03:51:36.758	2025-11-07 03:51:36.758
59	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.46729294886376893	Sofa góc mẫu 4 - ảnh 1	t	12	2025-11-07 03:51:36.762	2025-11-07 03:51:36.762
60	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.9766486001913783	Sofa góc mẫu 4 - ảnh 2	f	12	2025-11-07 03:51:36.763	2025-11-07 03:51:36.763
61	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.23392326531961727	Sofa đơn mẫu 1 - ảnh 1	t	13	2025-11-07 03:51:36.77	2025-11-07 03:51:36.77
62	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.0006534041700663185	Sofa đơn mẫu 1 - ảnh 2	f	13	2025-11-07 03:51:36.771	2025-11-07 03:51:36.771
63	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.5132365644724468	Sofa đơn mẫu 1 - ảnh 1	t	13	2025-11-07 03:51:36.775	2025-11-07 03:51:36.775
64	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.9615468109313554	Sofa đơn mẫu 1 - ảnh 2	f	13	2025-11-07 03:51:36.777	2025-11-07 03:51:36.777
65	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.3693787398079693	Sofa đơn mẫu 2 - ảnh 1	t	14	2025-11-07 03:51:36.784	2025-11-07 03:51:36.784
66	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.47615630583700175	Sofa đơn mẫu 2 - ảnh 2	f	14	2025-11-07 03:51:36.785	2025-11-07 03:51:36.785
67	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.33699868941043154	Sofa đơn mẫu 2 - ảnh 1	t	14	2025-11-07 03:51:36.789	2025-11-07 03:51:36.789
68	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.20587740312282654	Sofa đơn mẫu 2 - ảnh 2	f	14	2025-11-07 03:51:36.79	2025-11-07 03:51:36.79
69	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.6754328348944567	Sofa đơn mẫu 2 - ảnh 1	t	14	2025-11-07 03:51:36.795	2025-11-07 03:51:36.795
70	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.24339589064878164	Sofa đơn mẫu 2 - ảnh 2	f	14	2025-11-07 03:51:36.796	2025-11-07 03:51:36.796
71	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.7762181521435858	Sofa đơn mẫu 3 - ảnh 1	t	15	2025-11-07 03:51:36.803	2025-11-07 03:51:36.803
72	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.16567388331014365	Sofa đơn mẫu 3 - ảnh 2	f	15	2025-11-07 03:51:36.804	2025-11-07 03:51:36.804
73	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.2693678152914045	Sofa đơn mẫu 3 - ảnh 1	t	15	2025-11-07 03:51:36.809	2025-11-07 03:51:36.809
74	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.36601045457076276	Sofa đơn mẫu 3 - ảnh 2	f	15	2025-11-07 03:51:36.81	2025-11-07 03:51:36.81
75	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.6105361795486004	Sofa đơn mẫu 4 - ảnh 1	t	16	2025-11-07 03:51:36.817	2025-11-07 03:51:36.817
76	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.43926084059472625	Sofa đơn mẫu 4 - ảnh 2	f	16	2025-11-07 03:51:36.819	2025-11-07 03:51:36.819
77	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.4293988670025304	Sofa đơn mẫu 4 - ảnh 1	t	16	2025-11-07 03:51:36.824	2025-11-07 03:51:36.824
78	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.5245598677180754	Sofa đơn mẫu 4 - ảnh 2	f	16	2025-11-07 03:51:36.825	2025-11-07 03:51:36.825
79	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.407734781363597	Sofa đơn mẫu 4 - ảnh 1	t	16	2025-11-07 03:51:36.83	2025-11-07 03:51:36.83
80	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.9325208450412437	Sofa đơn mẫu 4 - ảnh 2	f	16	2025-11-07 03:51:36.831	2025-11-07 03:51:36.831
81	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.6809003763026305	Sofa giường mẫu 1 - ảnh 1	t	17	2025-11-07 03:51:36.838	2025-11-07 03:51:36.838
82	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.8062328994775017	Sofa giường mẫu 1 - ảnh 2	f	17	2025-11-07 03:51:36.84	2025-11-07 03:51:36.84
83	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.8302068581730659	Sofa giường mẫu 1 - ảnh 1	t	17	2025-11-07 03:51:36.844	2025-11-07 03:51:36.844
84	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.1357986437777221	Sofa giường mẫu 1 - ảnh 2	f	17	2025-11-07 03:51:36.846	2025-11-07 03:51:36.846
85	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.27196805904945087	Sofa giường mẫu 2 - ảnh 1	t	18	2025-11-07 03:51:36.853	2025-11-07 03:51:36.853
86	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.6900451024615848	Sofa giường mẫu 2 - ảnh 2	f	18	2025-11-07 03:51:36.854	2025-11-07 03:51:36.854
87	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.26037481435775	Sofa giường mẫu 2 - ảnh 1	t	18	2025-11-07 03:51:36.858	2025-11-07 03:51:36.858
88	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.05311932022490051	Sofa giường mẫu 2 - ảnh 2	f	18	2025-11-07 03:51:36.86	2025-11-07 03:51:36.86
89	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.46798447663976983	Sofa giường mẫu 2 - ảnh 1	t	18	2025-11-07 03:51:36.864	2025-11-07 03:51:36.864
90	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.8967198934468323	Sofa giường mẫu 2 - ảnh 2	f	18	2025-11-07 03:51:36.865	2025-11-07 03:51:36.865
91	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.4758474989674881	Sofa giường mẫu 3 - ảnh 1	t	19	2025-11-07 03:51:36.872	2025-11-07 03:51:36.872
92	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.1054510646858764	Sofa giường mẫu 3 - ảnh 2	f	19	2025-11-07 03:51:36.874	2025-11-07 03:51:36.874
93	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.5482016060937418	Sofa giường mẫu 3 - ảnh 1	t	19	2025-11-07 03:51:36.878	2025-11-07 03:51:36.878
94	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.03947621807016244	Sofa giường mẫu 3 - ảnh 2	f	19	2025-11-07 03:51:36.879	2025-11-07 03:51:36.879
95	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.6032835485485846	Sofa giường mẫu 4 - ảnh 1	t	20	2025-11-07 03:51:36.886	2025-11-07 03:51:36.886
96	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.7047411460974233	Sofa giường mẫu 4 - ảnh 2	f	20	2025-11-07 03:51:36.888	2025-11-07 03:51:36.888
97	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.14795146021540728	Sofa giường mẫu 4 - ảnh 1	t	20	2025-11-07 03:51:36.892	2025-11-07 03:51:36.892
98	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.6108605740842576	Sofa giường mẫu 4 - ảnh 2	f	20	2025-11-07 03:51:36.893	2025-11-07 03:51:36.893
99	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.18666105316489845	Sofa thư giãn mẫu 1 - ảnh 1	t	21	2025-11-07 03:51:36.9	2025-11-07 03:51:36.9
100	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.9070002847572416	Sofa thư giãn mẫu 1 - ảnh 2	f	21	2025-11-07 03:51:36.902	2025-11-07 03:51:36.902
101	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.8890552167682078	Sofa thư giãn mẫu 1 - ảnh 1	t	21	2025-11-07 03:51:36.906	2025-11-07 03:51:36.906
102	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.960791448702693	Sofa thư giãn mẫu 1 - ảnh 2	f	21	2025-11-07 03:51:36.907	2025-11-07 03:51:36.907
103	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.754479347773289	Sofa thư giãn mẫu 1 - ảnh 1	t	21	2025-11-07 03:51:36.911	2025-11-07 03:51:36.911
104	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.33528517751786313	Sofa thư giãn mẫu 1 - ảnh 2	f	21	2025-11-07 03:51:36.912	2025-11-07 03:51:36.912
105	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.0185743781316956	Sofa thư giãn mẫu 2 - ảnh 1	t	22	2025-11-07 03:51:36.919	2025-11-07 03:51:36.919
106	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.7264989581797225	Sofa thư giãn mẫu 2 - ảnh 2	f	22	2025-11-07 03:51:36.921	2025-11-07 03:51:36.921
107	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.5475430773106025	Sofa thư giãn mẫu 2 - ảnh 1	t	22	2025-11-07 03:51:36.925	2025-11-07 03:51:36.925
108	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.20113963976395977	Sofa thư giãn mẫu 2 - ảnh 2	f	22	2025-11-07 03:51:36.926	2025-11-07 03:51:36.926
109	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.700530205008423	Sofa thư giãn mẫu 2 - ảnh 1	t	22	2025-11-07 03:51:36.931	2025-11-07 03:51:36.931
110	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.7010372630681176	Sofa thư giãn mẫu 2 - ảnh 2	f	22	2025-11-07 03:51:36.932	2025-11-07 03:51:36.932
111	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.3781018216475718	Sofa thư giãn mẫu 3 - ảnh 1	t	23	2025-11-07 03:51:36.939	2025-11-07 03:51:36.939
112	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.4464681756493356	Sofa thư giãn mẫu 3 - ảnh 2	f	23	2025-11-07 03:51:36.941	2025-11-07 03:51:36.941
113	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.7824637287330618	Sofa thư giãn mẫu 3 - ảnh 1	t	23	2025-11-07 03:51:36.945	2025-11-07 03:51:36.945
114	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.9749057555540757	Sofa thư giãn mẫu 3 - ảnh 2	f	23	2025-11-07 03:51:36.946	2025-11-07 03:51:36.946
115	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.19990615324514982	Sofa thư giãn mẫu 4 - ảnh 1	t	24	2025-11-07 03:51:36.953	2025-11-07 03:51:36.953
116	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.8426172056300307	Sofa thư giãn mẫu 4 - ảnh 2	f	24	2025-11-07 03:51:36.954	2025-11-07 03:51:36.954
117	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?rand=0.07188279786256513	Sofa thư giãn mẫu 4 - ảnh 1	t	24	2025-11-07 03:51:36.959	2025-11-07 03:51:36.959
118	https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a?rand=0.15908003189194453	Sofa thư giãn mẫu 4 - ảnh 2	f	24	2025-11-07 03:51:36.96	2025-11-07 03:51:36.96
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductVariant" (id, "productId", name, "skuPrefix", price, "compareAtPrice", attributes, image, "createdAt", "updatedAt") FROM stdin;
1	1	Sofa da mẫu 1 (leather)	\N	15758576.00	16758576.00	{"color": "#FFFFFF", "material": "leather"}	\N	2025-11-07 03:51:36.554	2025-11-07 03:51:36.554
2	1	Sofa da mẫu 1 (leather)	\N	16192394.00	17192394.00	{"color": "#8B4513", "material": "leather"}	\N	2025-11-07 03:51:36.564	2025-11-07 03:51:36.564
3	2	Sofa da mẫu 2 (fabric)	\N	10235909.00	11235909.00	{"color": "#A0522D", "material": "fabric"}	\N	2025-11-07 03:51:36.576	2025-11-07 03:51:36.576
4	2	Sofa da mẫu 2 (leather)	\N	9011488.00	10011488.00	{"color": "#A0522D", "material": "leather"}	\N	2025-11-07 03:51:36.583	2025-11-07 03:51:36.583
5	2	Sofa da mẫu 2 (fabric)	\N	11704597.00	12704597.00	{"color": "#808080", "material": "fabric"}	\N	2025-11-07 03:51:36.589	2025-11-07 03:51:36.589
6	3	Sofa da mẫu 3 (leather)	\N	12829622.00	13829622.00	{"color": "#FFFFFF", "material": "leather"}	\N	2025-11-07 03:51:36.597	2025-11-07 03:51:36.597
7	3	Sofa da mẫu 3 (leather)	\N	17068305.00	18068305.00	{"color": "#C0C0C0", "material": "leather"}	\N	2025-11-07 03:51:36.604	2025-11-07 03:51:36.604
8	3	Sofa da mẫu 3 (leather)	\N	13437996.00	14437996.00	{"color": "#000000", "material": "leather"}	\N	2025-11-07 03:51:36.61	2025-11-07 03:51:36.61
9	4	Sofa da mẫu 4 (leather)	\N	17942785.00	18942785.00	{"color": "#FFFFFF", "material": "leather"}	\N	2025-11-07 03:51:36.619	2025-11-07 03:51:36.619
10	4	Sofa da mẫu 4 (fabric)	\N	9059075.00	10059075.00	{"color": "#8B4513", "material": "fabric"}	\N	2025-11-07 03:51:36.624	2025-11-07 03:51:36.624
11	4	Sofa da mẫu 4 (fabric)	\N	15331485.00	16331485.00	{"color": "#8B4513", "material": "fabric"}	\N	2025-11-07 03:51:36.63	2025-11-07 03:51:36.63
12	5	Sofa vải nỉ mẫu 1 (leather)	\N	12033910.00	13033910.00	{"color": "#8B4513", "material": "leather"}	\N	2025-11-07 03:51:36.638	2025-11-07 03:51:36.638
13	5	Sofa vải nỉ mẫu 1 (leather)	\N	12355322.00	13355322.00	{"color": "#A0522D", "material": "leather"}	\N	2025-11-07 03:51:36.644	2025-11-07 03:51:36.644
14	5	Sofa vải nỉ mẫu 1 (fabric)	\N	17351285.00	18351285.00	{"color": "#C0C0C0", "material": "fabric"}	\N	2025-11-07 03:51:36.649	2025-11-07 03:51:36.649
15	6	Sofa vải nỉ mẫu 2 (leather)	\N	17077031.00	18077031.00	{"color": "#A0522D", "material": "leather"}	\N	2025-11-07 03:51:36.658	2025-11-07 03:51:36.658
16	6	Sofa vải nỉ mẫu 2 (leather)	\N	14973874.00	15973874.00	{"color": "#808080", "material": "leather"}	\N	2025-11-07 03:51:36.663	2025-11-07 03:51:36.663
17	7	Sofa vải nỉ mẫu 3 (fabric)	\N	18505392.00	19505392.00	{"color": "#C0C0C0", "material": "fabric"}	\N	2025-11-07 03:51:36.671	2025-11-07 03:51:36.671
18	7	Sofa vải nỉ mẫu 3 (leather)	\N	14909564.00	15909564.00	{"color": "#808080", "material": "leather"}	\N	2025-11-07 03:51:36.677	2025-11-07 03:51:36.677
19	7	Sofa vải nỉ mẫu 3 (leather)	\N	11856346.00	12856346.00	{"color": "#FFFFFF", "material": "leather"}	\N	2025-11-07 03:51:36.683	2025-11-07 03:51:36.683
20	8	Sofa vải nỉ mẫu 4 (leather)	\N	12239344.00	13239344.00	{"color": "#000000", "material": "leather"}	\N	2025-11-07 03:51:36.691	2025-11-07 03:51:36.691
21	8	Sofa vải nỉ mẫu 4 (fabric)	\N	16028443.00	17028443.00	{"color": "#000000", "material": "fabric"}	\N	2025-11-07 03:51:36.696	2025-11-07 03:51:36.696
22	9	Sofa góc mẫu 1 (leather)	\N	11945756.00	12945756.00	{"color": "#A0522D", "material": "leather"}	\N	2025-11-07 03:51:36.704	2025-11-07 03:51:36.704
23	9	Sofa góc mẫu 1 (leather)	\N	9502474.00	10502474.00	{"color": "#8B4513", "material": "leather"}	\N	2025-11-07 03:51:36.71	2025-11-07 03:51:36.71
24	9	Sofa góc mẫu 1 (fabric)	\N	12203679.00	13203679.00	{"color": "#FFFFFF", "material": "fabric"}	\N	2025-11-07 03:51:36.715	2025-11-07 03:51:36.715
25	10	Sofa góc mẫu 2 (fabric)	\N	11790069.00	12790069.00	{"color": "#FFFFFF", "material": "fabric"}	\N	2025-11-07 03:51:36.724	2025-11-07 03:51:36.724
26	10	Sofa góc mẫu 2 (leather)	\N	10281662.00	11281662.00	{"color": "#C0C0C0", "material": "leather"}	\N	2025-11-07 03:51:36.73	2025-11-07 03:51:36.73
27	11	Sofa góc mẫu 3 (fabric)	\N	10605701.00	11605701.00	{"color": "#A0522D", "material": "fabric"}	\N	2025-11-07 03:51:36.74	2025-11-07 03:51:36.74
28	11	Sofa góc mẫu 3 (fabric)	\N	14248582.00	15248582.00	{"color": "#C0C0C0", "material": "fabric"}	\N	2025-11-07 03:51:36.745	2025-11-07 03:51:36.745
29	12	Sofa góc mẫu 4 (fabric)	\N	13953934.00	14953934.00	{"color": "#C0C0C0", "material": "fabric"}	\N	2025-11-07 03:51:36.754	2025-11-07 03:51:36.754
30	12	Sofa góc mẫu 4 (leather)	\N	16920852.00	17920852.00	{"color": "#8B4513", "material": "leather"}	\N	2025-11-07 03:51:36.759	2025-11-07 03:51:36.759
31	13	Sofa đơn mẫu 1 (leather)	\N	15504586.00	16504586.00	{"color": "#A0522D", "material": "leather"}	\N	2025-11-07 03:51:36.767	2025-11-07 03:51:36.767
32	13	Sofa đơn mẫu 1 (leather)	\N	11211390.00	12211390.00	{"color": "#C0C0C0", "material": "leather"}	\N	2025-11-07 03:51:36.772	2025-11-07 03:51:36.772
33	14	Sofa đơn mẫu 2 (leather)	\N	10070122.00	11070122.00	{"color": "#000000", "material": "leather"}	\N	2025-11-07 03:51:36.781	2025-11-07 03:51:36.781
34	14	Sofa đơn mẫu 2 (fabric)	\N	13640369.00	14640369.00	{"color": "#A0522D", "material": "fabric"}	\N	2025-11-07 03:51:36.786	2025-11-07 03:51:36.786
35	14	Sofa đơn mẫu 2 (fabric)	\N	9510183.00	10510183.00	{"color": "#8B4513", "material": "fabric"}	\N	2025-11-07 03:51:36.792	2025-11-07 03:51:36.792
36	15	Sofa đơn mẫu 3 (fabric)	\N	13927410.00	14927410.00	{"color": "#808080", "material": "fabric"}	\N	2025-11-07 03:51:36.8	2025-11-07 03:51:36.8
37	15	Sofa đơn mẫu 3 (fabric)	\N	9756333.00	10756333.00	{"color": "#C0C0C0", "material": "fabric"}	\N	2025-11-07 03:51:36.806	2025-11-07 03:51:36.806
38	16	Sofa đơn mẫu 4 (leather)	\N	13735135.00	14735135.00	{"color": "#808080", "material": "leather"}	\N	2025-11-07 03:51:36.814	2025-11-07 03:51:36.814
39	16	Sofa đơn mẫu 4 (fabric)	\N	18833360.00	19833360.00	{"color": "#FFFFFF", "material": "fabric"}	\N	2025-11-07 03:51:36.82	2025-11-07 03:51:36.82
40	16	Sofa đơn mẫu 4 (leather)	\N	16785110.00	17785110.00	{"color": "#A0522D", "material": "leather"}	\N	2025-11-07 03:51:36.827	2025-11-07 03:51:36.827
41	17	Sofa giường mẫu 1 (fabric)	\N	13688811.00	14688811.00	{"color": "#FFFFFF", "material": "fabric"}	\N	2025-11-07 03:51:36.835	2025-11-07 03:51:36.835
42	17	Sofa giường mẫu 1 (leather)	\N	9734839.00	10734839.00	{"color": "#808080", "material": "leather"}	\N	2025-11-07 03:51:36.841	2025-11-07 03:51:36.841
43	18	Sofa giường mẫu 2 (leather)	\N	18635990.00	19635990.00	{"color": "#808080", "material": "leather"}	\N	2025-11-07 03:51:36.85	2025-11-07 03:51:36.85
44	18	Sofa giường mẫu 2 (fabric)	\N	15190173.00	16190173.00	{"color": "#A0522D", "material": "fabric"}	\N	2025-11-07 03:51:36.855	2025-11-07 03:51:36.855
45	18	Sofa giường mẫu 2 (fabric)	\N	18513140.00	19513140.00	{"color": "#000000", "material": "fabric"}	\N	2025-11-07 03:51:36.861	2025-11-07 03:51:36.861
46	19	Sofa giường mẫu 3 (leather)	\N	14782866.00	15782866.00	{"color": "#FFFFFF", "material": "leather"}	\N	2025-11-07 03:51:36.869	2025-11-07 03:51:36.869
47	19	Sofa giường mẫu 3 (leather)	\N	12626114.00	13626114.00	{"color": "#C0C0C0", "material": "leather"}	\N	2025-11-07 03:51:36.875	2025-11-07 03:51:36.875
48	20	Sofa giường mẫu 4 (fabric)	\N	10338593.00	11338593.00	{"color": "#8B4513", "material": "fabric"}	\N	2025-11-07 03:51:36.883	2025-11-07 03:51:36.883
49	20	Sofa giường mẫu 4 (leather)	\N	11771737.00	12771737.00	{"color": "#FFFFFF", "material": "leather"}	\N	2025-11-07 03:51:36.889	2025-11-07 03:51:36.889
50	21	Sofa thư giãn mẫu 1 (leather)	\N	12051930.00	13051930.00	{"color": "#000000", "material": "leather"}	\N	2025-11-07 03:51:36.897	2025-11-07 03:51:36.897
51	21	Sofa thư giãn mẫu 1 (leather)	\N	18059576.00	19059576.00	{"color": "#8B4513", "material": "leather"}	\N	2025-11-07 03:51:36.903	2025-11-07 03:51:36.903
52	21	Sofa thư giãn mẫu 1 (leather)	\N	16909890.00	17909890.00	{"color": "#C0C0C0", "material": "leather"}	\N	2025-11-07 03:51:36.908	2025-11-07 03:51:36.908
53	22	Sofa thư giãn mẫu 2 (leather)	\N	18280321.00	19280321.00	{"color": "#808080", "material": "leather"}	\N	2025-11-07 03:51:36.916	2025-11-07 03:51:36.916
54	22	Sofa thư giãn mẫu 2 (fabric)	\N	14819013.00	15819013.00	{"color": "#808080", "material": "fabric"}	\N	2025-11-07 03:51:36.922	2025-11-07 03:51:36.922
55	22	Sofa thư giãn mẫu 2 (leather)	\N	13138319.00	14138319.00	{"color": "#A0522D", "material": "leather"}	\N	2025-11-07 03:51:36.928	2025-11-07 03:51:36.928
56	23	Sofa thư giãn mẫu 3 (leather)	\N	15668735.00	16668735.00	{"color": "#000000", "material": "leather"}	\N	2025-11-07 03:51:36.936	2025-11-07 03:51:36.936
57	23	Sofa thư giãn mẫu 3 (leather)	\N	13111261.00	14111261.00	{"color": "#808080", "material": "leather"}	\N	2025-11-07 03:51:36.942	2025-11-07 03:51:36.942
58	24	Sofa thư giãn mẫu 4 (leather)	\N	15723173.00	16723173.00	{"color": "#A0522D", "material": "leather"}	\N	2025-11-07 03:51:36.95	2025-11-07 03:51:36.95
59	24	Sofa thư giãn mẫu 4 (fabric)	\N	9882000.00	10882000.00	{"color": "#FFFFFF", "material": "fabric"}	\N	2025-11-07 03:51:36.956	2025-11-07 03:51:36.956
\.


--
-- Data for Name: Refund; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Refund" (id, "orderId", "returnRequestId", amount, method, status, "providerRef", metadata, "createdAt", "processedAt") FROM stdin;
\.


--
-- Data for Name: ReturnRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ReturnRequest" (id, "orderId", "orderItemId", reason, status, evidence, "requestedAt", "processedAt", metadata) FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Review" (id, "userId", "productId", rating, title, body, approved, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Role" (id, name) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, username, password, "displayName", "createdAt", "updatedAt", "lastLogin") FROM stdin;
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserRole" (id, "userId", "roleId") FROM stdin;
\.


--
-- Data for Name: Wishlist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Wishlist" (id, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WishlistItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WishlistItem" (id, "wishlistId", "productId", "variantId", "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c1dec07c-fbfc-4478-a9dd-46b88de703af	e83eb3e80eb8762b4bf1bcb0a91f10b81b240b7d8917dedc81bb9da42e960a88	2025-11-07 03:43:17.967589+00	20251107034317_init	\N	\N	2025-11-07 03:43:17.726086+00	1
\.


--
-- Name: Address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Address_id_seq"', 1, false);


--
-- Name: AuditLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AuditLog_id_seq"', 1, false);


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Category_id_seq"', 6, true);


--
-- Name: Coupon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Coupon_id_seq"', 1, false);


--
-- Name: Inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Inventory_id_seq"', 59, true);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."OrderItem_id_seq"', 1, false);


--
-- Name: OrderStatusHistory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."OrderStatusHistory_id_seq"', 1, false);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Order_id_seq"', 1, false);


--
-- Name: PaymentMeta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."PaymentMeta_id_seq"', 1, false);


--
-- Name: ProductImage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ProductImage_id_seq"', 118, true);


--
-- Name: ProductVariant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ProductVariant_id_seq"', 59, true);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Product_id_seq"', 24, true);


--
-- Name: Refund_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Refund_id_seq"', 1, false);


--
-- Name: ReturnRequest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ReturnRequest_id_seq"', 1, false);


--
-- Name: Review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Review_id_seq"', 1, false);


--
-- Name: Role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Role_id_seq"', 1, false);


--
-- Name: UserRole_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."UserRole_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- Name: WishlistItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."WishlistItem_id_seq"', 1, false);


--
-- Name: Wishlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Wishlist_id_seq"', 1, false);


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: Inventory Inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: OrderStatusHistory OrderStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PaymentMeta PaymentMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentMeta"
    ADD CONSTRAINT "PaymentMeta_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Refund Refund_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_pkey" PRIMARY KEY (id);


--
-- Name: ReturnRequest ReturnRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReturnRequest"
    ADD CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WishlistItem WishlistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_pkey" PRIMARY KEY (id);


--
-- Name: Wishlist Wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: Inventory_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Inventory_sku_key" ON public."Inventory" USING btree (sku);


--
-- Name: Order_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_createdAt_idx" ON public."Order" USING btree ("createdAt");


--
-- Name: Order_orderNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_orderNumber_idx" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");


--
-- Name: PaymentMeta_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PaymentMeta_orderId_key" ON public."PaymentMeta" USING btree ("orderId");


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: Refund_returnRequestId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Refund_returnRequestId_key" ON public."Refund" USING btree ("returnRequestId");


--
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Wishlist_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Wishlist_userId_key" ON public."Wishlist" USING btree ("userId");


--
-- Name: idx_address_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_address_user ON public."Address" USING btree ("userId");


--
-- Name: idx_audit_actor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_actor ON public."AuditLog" USING btree ("actorId");


--
-- Name: idx_audit_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_entity ON public."AuditLog" USING btree (entity, "entityId");


--
-- Name: idx_category_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_name ON public."Category" USING btree (name);


--
-- Name: idx_coupon_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupon_code ON public."Coupon" USING btree (code);


--
-- Name: idx_inventory_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_sku ON public."Inventory" USING btree (sku);


--
-- Name: idx_inventory_variant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_variant ON public."Inventory" USING btree ("variantId");


--
-- Name: idx_orderitem_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orderitem_order ON public."OrderItem" USING btree ("orderId");


--
-- Name: idx_orderitem_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orderitem_product ON public."OrderItem" USING btree ("productId");


--
-- Name: idx_orderstatushistory_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orderstatushistory_order ON public."OrderStatusHistory" USING btree ("orderId");


--
-- Name: idx_orderstatushistory_toStatus; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_orderstatushistory_toStatus" ON public."OrderStatusHistory" USING btree ("toStatus");


--
-- Name: idx_payment_transaction; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transaction ON public."PaymentMeta" USING btree ("transactionId");


--
-- Name: idx_product_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_category ON public."Product" USING btree ("categoryId");


--
-- Name: idx_product_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_product_createdAt" ON public."Product" USING btree ("createdAt");


--
-- Name: idx_product_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_slug ON public."Product" USING btree (slug);


--
-- Name: idx_product_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_status ON public."Product" USING btree (status);


--
-- Name: idx_product_title; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_title ON public."Product" USING btree (title);


--
-- Name: idx_product_title_shortdesc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_title_shortdesc ON public."Product" USING btree (title, "shortDescription");


--
-- Name: idx_productimage_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productimage_product ON public."ProductImage" USING btree ("productId");


--
-- Name: idx_refund_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refund_order ON public."Refund" USING btree ("orderId");


--
-- Name: idx_return_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_return_order ON public."ReturnRequest" USING btree ("orderId");


--
-- Name: idx_return_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_return_status ON public."ReturnRequest" USING btree (status);


--
-- Name: idx_review_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_product ON public."Review" USING btree ("productId");


--
-- Name: idx_review_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_user ON public."Review" USING btree ("userId");


--
-- Name: idx_user_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_email ON public."User" USING btree (email);


--
-- Name: idx_userrole_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_userrole_role ON public."UserRole" USING btree ("roleId");


--
-- Name: idx_variant_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_variant_name ON public."ProductVariant" USING btree (name);


--
-- Name: idx_variant_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_variant_product ON public."ProductVariant" USING btree ("productId");


--
-- Name: idx_wishlist_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wishlist_product ON public."WishlistItem" USING btree ("productId");


--
-- Name: uq_review_user_product; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_review_user_product ON public."Review" USING btree ("userId", "productId");


--
-- Name: uq_user_role; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_user_role ON public."UserRole" USING btree ("userId", "roleId");


--
-- Name: uq_wishlist_item; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_wishlist_item ON public."WishlistItem" USING btree ("wishlistId", "productId", "variantId");


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuditLog AuditLog_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Inventory Inventory_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderItem OrderItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderStatusHistory OrderStatusHistory_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderStatusHistory OrderStatusHistory_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_billingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES public."Address"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public."Coupon"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_shippingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES public."Address"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PaymentMeta PaymentMeta_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentMeta"
    ADD CONSTRAINT "PaymentMeta_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Refund Refund_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Refund Refund_returnRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES public."ReturnRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReturnRequest ReturnRequest_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReturnRequest"
    ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReturnRequest ReturnRequest_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReturnRequest"
    ADD CONSTRAINT "ReturnRequest_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public."OrderItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserRole UserRole_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserRole UserRole_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WishlistItem WishlistItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WishlistItem WishlistItem_wishlistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES public."Wishlist"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Wishlist Wishlist_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict ZeawJUg1Q7UGZwcO6PNJ8WQbdBSolVuNmTb1jV9KymkZFx2lc5uYyMlEq7vWJ5X

