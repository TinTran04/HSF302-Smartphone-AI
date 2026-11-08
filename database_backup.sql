--
-- PostgreSQL database dump
--

\restrict ByAFhtBBUFNjID1JWCVSxnCHEkNRrfw3aQUZHuKKRrtyeVPx4YJsmatwEHWqUIc

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_brand_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_specifications DROP CONSTRAINT IF EXISTS product_specifications_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_preview_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_status_history DROP CONSTRAINT IF EXISTS order_status_history_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_previews DROP CONSTRAINT IF EXISTS order_previews_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_preview_items DROP CONSTRAINT IF EXISTS order_preview_items_variant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_preview_items DROP CONSTRAINT IF EXISTS order_preview_items_preview_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.knowledge_chunks DROP CONSTRAINT IF EXISTS knowledge_chunks_document_id_fkey;
ALTER TABLE IF EXISTS ONLY public.carts DROP CONSTRAINT IF EXISTS carts_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_variant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ai_topic_switch_requests DROP CONSTRAINT IF EXISTS ai_topic_switch_requests_new_conversation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ai_topic_switch_requests DROP CONSTRAINT IF EXISTS ai_topic_switch_requests_conversation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ai_messages DROP CONSTRAINT IF EXISTS ai_messages_conversation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_guest_id_fkey;
ALTER TABLE IF EXISTS ONLY public.admin_invitations DROP CONSTRAINT IF EXISTS admin_invitations_user_id_fkey;
DROP INDEX IF EXISTS public.idx_product_variants_product;
DROP INDEX IF EXISTS public.idx_otp_challenges_email_purpose;
DROP INDEX IF EXISTS public.idx_knowledge_chunks_document;
DROP INDEX IF EXISTS public.idx_ai_provider_configs_provider;
DROP INDEX IF EXISTS public.idx_ai_messages_conversation;
DROP INDEX IF EXISTS public.idx_ai_conversations_user;
DROP INDEX IF EXISTS public.idx_ai_conversations_guest;
DROP INDEX IF EXISTS public.flyway_schema_history_s_idx;
ALTER TABLE IF EXISTS ONLY public.vector_store DROP CONSTRAINT IF EXISTS vector_store_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_root_key_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_variants DROP CONSTRAINT IF EXISTS product_variants_pkey;
ALTER TABLE IF EXISTS ONLY public.product_specifications DROP CONSTRAINT IF EXISTS product_specifications_pkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_pkey;
ALTER TABLE IF EXISTS ONLY public.otp_challenges DROP CONSTRAINT IF EXISTS otp_challenges_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_idempotency_key_key;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_status_history DROP CONSTRAINT IF EXISTS order_status_history_pkey;
ALTER TABLE IF EXISTS ONLY public.order_previews DROP CONSTRAINT IF EXISTS order_previews_pkey;
ALTER TABLE IF EXISTS ONLY public.order_preview_items DROP CONSTRAINT IF EXISTS order_preview_items_preview_id_variant_id_key;
ALTER TABLE IF EXISTS ONLY public.order_preview_items DROP CONSTRAINT IF EXISTS order_preview_items_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.knowledge_documents DROP CONSTRAINT IF EXISTS knowledge_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.knowledge_chunks DROP CONSTRAINT IF EXISTS knowledge_chunks_pkey;
ALTER TABLE IF EXISTS ONLY public.flyway_schema_history DROP CONSTRAINT IF EXISTS flyway_schema_history_pk;
ALTER TABLE IF EXISTS ONLY public.embedding_configs DROP CONSTRAINT IF EXISTS embedding_configs_pkey;
ALTER TABLE IF EXISTS ONLY public.carts DROP CONSTRAINT IF EXISTS carts_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_variant_id_key;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_pkey;
ALTER TABLE IF EXISTS ONLY public.brands DROP CONSTRAINT IF EXISTS brands_pkey;
ALTER TABLE IF EXISTS ONLY public.brands DROP CONSTRAINT IF EXISTS brands_name_key;
ALTER TABLE IF EXISTS ONLY public.ai_topic_switch_requests DROP CONSTRAINT IF EXISTS ai_topic_switch_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.ai_provider_configs DROP CONSTRAINT IF EXISTS ai_provider_configs_pkey;
ALTER TABLE IF EXISTS ONLY public.ai_messages DROP CONSTRAINT IF EXISTS ai_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.ai_guest_sessions DROP CONSTRAINT IF EXISTS ai_guest_sessions_token_hash_key;
ALTER TABLE IF EXISTS ONLY public.ai_guest_sessions DROP CONSTRAINT IF EXISTS ai_guest_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_invitations DROP CONSTRAINT IF EXISTS admin_invitations_user_id_key;
ALTER TABLE IF EXISTS ONLY public.admin_invitations DROP CONSTRAINT IF EXISTS admin_invitations_token_hash_key;
ALTER TABLE IF EXISTS ONLY public.admin_invitations DROP CONSTRAINT IF EXISTS admin_invitations_pkey;
DROP TABLE IF EXISTS public.vector_store;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.system_settings;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.product_variants;
DROP TABLE IF EXISTS public.product_specifications;
DROP TABLE IF EXISTS public.product_images;
DROP TABLE IF EXISTS public.otp_challenges;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.order_status_history;
DROP TABLE IF EXISTS public.order_previews;
DROP TABLE IF EXISTS public.order_preview_items;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.knowledge_documents;
DROP TABLE IF EXISTS public.knowledge_chunks;
DROP TABLE IF EXISTS public.flyway_schema_history;
DROP TABLE IF EXISTS public.embedding_configs;
DROP TABLE IF EXISTS public.carts;
DROP TABLE IF EXISTS public.cart_items;
DROP TABLE IF EXISTS public.brands;
DROP TABLE IF EXISTS public.ai_topic_switch_requests;
DROP TABLE IF EXISTS public.ai_provider_configs;
DROP TABLE IF EXISTS public.ai_messages;
DROP TABLE IF EXISTS public.ai_guest_sessions;
DROP TABLE IF EXISTS public.ai_conversations;
DROP TABLE IF EXISTS public.admin_invitations;
DROP EXTENSION IF EXISTS vector;
--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_invitations (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    consumed boolean DEFAULT false NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.admin_invitations OWNER TO postgres;

--
-- Name: ai_conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_conversations (
    id uuid NOT NULL,
    user_id uuid,
    guest_id uuid,
    topic character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    product_ids text NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    CONSTRAINT ai_conversations_check CHECK ((((user_id IS NOT NULL) AND (guest_id IS NULL)) OR ((user_id IS NULL) AND (guest_id IS NOT NULL))))
);


ALTER TABLE public.ai_conversations OWNER TO postgres;

--
-- Name: ai_guest_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_guest_sessions (
    id uuid NOT NULL,
    token_hash character varying(64) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    message_count integer DEFAULT 0 NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    CONSTRAINT ai_guest_sessions_message_count_check CHECK ((message_count >= 0))
);


ALTER TABLE public.ai_guest_sessions OWNER TO postgres;

--
-- Name: ai_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_messages (
    id bigint NOT NULL,
    conversation_id uuid NOT NULL,
    role character varying(255) NOT NULL,
    content text NOT NULL,
    sources_json text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    recommendations_json text DEFAULT '[]'::text NOT NULL,
    comparisons_json text DEFAULT '[]'::text NOT NULL
);


ALTER TABLE public.ai_messages OWNER TO postgres;

--
-- Name: ai_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.ai_messages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.ai_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ai_provider_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_provider_configs (
    id bigint NOT NULL,
    provider character varying(255) NOT NULL,
    model character varying(255) NOT NULL,
    key_cipher text NOT NULL,
    tested boolean DEFAULT false NOT NULL,
    active boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.ai_provider_configs OWNER TO postgres;

--
-- Name: ai_provider_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.ai_provider_configs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.ai_provider_configs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ai_topic_switch_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_topic_switch_requests (
    id uuid NOT NULL,
    conversation_id uuid NOT NULL,
    suggested_topic character varying(255) NOT NULL,
    question text NOT NULL,
    status character varying(255) NOT NULL,
    new_conversation_id uuid,
    expires_at timestamp with time zone NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.ai_topic_switch_requests OWNER TO postgres;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    id bigint NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.brands ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.brands_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    variant_id bigint NOT NULL,
    quantity integer NOT NULL,
    price_at_add bigint NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    CONSTRAINT cart_items_price_at_add_check CHECK ((price_at_add >= 0)),
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    user_id uuid NOT NULL
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: embedding_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.embedding_configs (
    id bigint NOT NULL,
    provider character varying(255) NOT NULL,
    model character varying(255) NOT NULL,
    key_cipher text NOT NULL,
    dimensions integer NOT NULL,
    active boolean DEFAULT false NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    CONSTRAINT embedding_configs_dimensions_check CHECK ((dimensions > 0))
);


ALTER TABLE public.embedding_configs OWNER TO postgres;

--
-- Name: embedding_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.embedding_configs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.embedding_configs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO postgres;

--
-- Name: knowledge_chunks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knowledge_chunks (
    id uuid NOT NULL,
    document_id uuid NOT NULL,
    page_number integer,
    content text NOT NULL,
    embedding_version character varying(255) NOT NULL
);


ALTER TABLE public.knowledge_chunks OWNER TO postgres;

--
-- Name: knowledge_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knowledge_documents (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    size bigint NOT NULL,
    pages_json text NOT NULL,
    uploaded_at timestamp with time zone NOT NULL,
    content_updated_at timestamp with time zone NOT NULL,
    status character varying(255) NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    embedding_version character varying(255),
    error character varying(255),
    version bigint DEFAULT 0 NOT NULL,
    processing_attempt uuid
);


ALTER TABLE public.knowledge_documents OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    variant_id bigint NOT NULL,
    product_name character varying(255) NOT NULL,
    color character varying(255) NOT NULL,
    storage character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_price bigint NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_items_unit_price_check CHECK ((unit_price >= 0))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_preview_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_preview_items (
    id uuid NOT NULL,
    preview_id uuid NOT NULL,
    variant_id bigint NOT NULL,
    quantity integer NOT NULL,
    old_unit_price bigint NOT NULL,
    unit_price bigint NOT NULL,
    CONSTRAINT order_preview_items_old_unit_price_check CHECK ((old_unit_price >= 0)),
    CONSTRAINT order_preview_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_preview_items_unit_price_check CHECK ((unit_price >= 0))
);


ALTER TABLE public.order_preview_items OWNER TO postgres;

--
-- Name: order_previews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_previews (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    note character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.order_previews OWNER TO postgres;

--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_history (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    status character varying(255) NOT NULL,
    changed_at timestamp with time zone NOT NULL
);


ALTER TABLE public.order_status_history OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    preview_id uuid NOT NULL,
    idempotency_key character varying(128) NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    note character varying(255) NOT NULL,
    total bigint NOT NULL,
    status character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    CONSTRAINT orders_total_check CHECK ((total >= 0))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: otp_challenges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otp_challenges (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    purpose character varying(255) NOT NULL,
    code_hash character varying(255) NOT NULL,
    issued_at timestamp with time zone NOT NULL,
    failed_attempts integer DEFAULT 0 NOT NULL,
    consumed boolean DEFAULT false NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    deliverable boolean DEFAULT true NOT NULL,
    CONSTRAINT otp_challenges_failed_attempts_check CHECK ((failed_attempts >= 0))
);


ALTER TABLE public.otp_challenges OWNER TO postgres;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    product_id bigint NOT NULL,
    "position" integer NOT NULL,
    url character varying(255) NOT NULL
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: product_specifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_specifications (
    product_id bigint NOT NULL,
    spec_name character varying(255) NOT NULL,
    spec_value character varying(255) NOT NULL
);


ALTER TABLE public.product_specifications OWNER TO postgres;

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    color character varying(255) NOT NULL,
    storage character varying(255) NOT NULL,
    price bigint NOT NULL,
    active boolean DEFAULT true NOT NULL,
    color_hex character varying(255),
    image character varying(255),
    CONSTRAINT product_variants_price_check CHECK ((price >= 0))
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: product_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_variants ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_variants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    brand_id bigint,
    description text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.products ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    maintenance_enabled boolean DEFAULT false NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    CONSTRAINT system_settings_id_check CHECK ((id = 1))
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255),
    username character varying(255),
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    active boolean DEFAULT false NOT NULL,
    root_key character varying(255),
    version bigint DEFAULT 0 NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    CONSTRAINT users_check CHECK (((email IS NOT NULL) OR (username IS NOT NULL))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'STAFF'::character varying, 'MANAGER'::character varying, 'ADMIN'::character varying])::text[]))),
    CONSTRAINT users_root_key_check CHECK (((root_key IS NULL) OR ((root_key)::text = 'ROOT'::text)))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vector_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vector_store (
    id uuid NOT NULL,
    content text,
    metadata jsonb,
    embedding public.vector
);


ALTER TABLE public.vector_store OWNER TO postgres;

--
-- Data for Name: admin_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_invitations (id, user_id, token_hash, expires_at, consumed, version) FROM stdin;
\.


--
-- Data for Name: ai_conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_conversations (id, user_id, guest_id, topic, title, created_at, product_ids, version) FROM stdin;
\.


--
-- Data for Name: ai_guest_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_guest_sessions (id, token_hash, created_at, expires_at, message_count, revoked, version) FROM stdin;
4ca209fd-6210-49cd-8368-73497a5e9d9f	6ff1ff0fe8b017384844bf2ca5096a1951f6b9b783e315f0be6ba19ef8cb2046	2026-11-01 17:15:12.622405+07	2026-11-02 17:15:12.622405+07	0	t	1
83c430e0-458d-487a-8575-a6ae8c04b832	d5b0d711b9fbf0203f803f0096f383630bd5c039f1e047b1043f343a7d4680e2	2026-11-01 17:33:41.116278+07	2026-11-02 17:33:41.116278+07	0	t	1
\.


--
-- Data for Name: ai_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_messages (id, conversation_id, role, content, sources_json, created_at, recommendations_json, comparisons_json) FROM stdin;
\.


--
-- Data for Name: ai_provider_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_provider_configs (id, provider, model, key_cipher, tested, active, created_at, version) FROM stdin;
\.


--
-- Data for Name: ai_topic_switch_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_topic_switch_requests (id, conversation_id, suggested_topic, question, status, new_conversation_id, expires_at, version) FROM stdin;
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, name) FROM stdin;
1	Apple
2	Samsung
3	Xiaomi
4	OPPO
5	vivo
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, user_id, variant_id, quantity, price_at_add, version) FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (user_id) FROM stdin;
\.


--
-- Data for Name: embedding_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.embedding_configs (id, provider, model, key_cipher, dimensions, active, version) FROM stdin;
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	create products	SQL	V1__create_products.sql	173846680	postgres	2026-11-01 17:12:10.799986	17	t
2	2	add brands and variants	SQL	V2__add_brands_and_variants.sql	1807232787	postgres	2026-11-01 17:12:10.840301	16	t
3	3	add product content	SQL	V3__add_product_content.sql	-44181449	postgres	2026-11-01 17:12:10.86579	7	t
4	4	create otp challenges	SQL	V4__create_otp_challenges.sql	1940319833	postgres	2026-11-01 17:12:10.878058	8	t
5	5	create user accounts	SQL	V5__create_user_accounts.sql	1980203378	postgres	2026-11-01 17:12:10.893428	10	t
6	6	add otp delivery flag	SQL	V6__add_otp_delivery_flag.sql	-237371474	postgres	2026-11-01 17:12:10.911103	1	t
7	7	admin invitations	SQL	V7__admin_invitations.sql	221958627	postgres	2026-11-01 17:12:10.917121	6	t
8	8	system settings	SQL	V8__system_settings.sql	-1518164107	postgres	2026-11-01 17:12:10.927712	5	t
9	9	cart tables	SQL	V9__cart_tables.sql	-2052622122	postgres	2026-11-01 17:12:10.937443	8	t
10	10	orders	SQL	V10__orders.sql	-662299337	postgres	2026-11-01 17:12:10.951719	24	t
11	11	variant display	SQL	V11__variant_display.sql	-1930094752	postgres	2026-11-01 17:12:10.98211	1	t
12	12	ai provider configs	SQL	V12__ai_provider_configs.sql	524553187	postgres	2026-11-01 17:12:10.987068	7	t
13	13	ai conversations	SQL	V13__ai_conversations.sql	-465676620	postgres	2026-11-01 17:12:10.998677	21	t
14	14	chat product cards	SQL	V14__chat_product_cards.sql	-1389015924	postgres	2026-11-01 17:12:11.024954	2	t
15	15	knowledge documents	SQL	V15__knowledge_documents.sql	1913387059	postgres	2026-11-01 17:12:11.030981	9	t
16	16	pgvector store	SQL	V16__pgvector_store.sql	650621798	postgres	2026-11-01 17:12:11.045187	11	t
17	17	embedding configs	SQL	V17__embedding_configs.sql	-915673696	postgres	2026-11-01 17:12:11.061597	5	t
18	18	knowledge processing attempt	SQL	V18__knowledge_processing_attempt.sql	-760181825	postgres	2026-11-01 17:12:11.071372	2	t
19	19	add staff and manager roles	SQL	V19__add_staff_and_manager_roles.sql	263001676	postgres	2026-11-01 17:55:04.325945	57	t
\.


--
-- Data for Name: knowledge_chunks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knowledge_chunks (id, document_id, page_number, content, embedding_version) FROM stdin;
\.


--
-- Data for Name: knowledge_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knowledge_documents (id, name, size, pages_json, uploaded_at, content_updated_at, status, enabled, embedding_version, error, version, processing_attempt) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, variant_id, product_name, color, storage, quantity, unit_price) FROM stdin;
\.


--
-- Data for Name: order_preview_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_preview_items (id, preview_id, variant_id, quantity, old_unit_price, unit_price) FROM stdin;
\.


--
-- Data for Name: order_previews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_previews (id, user_id, full_name, phone, address, note, expires_at, used, version) FROM stdin;
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_status_history (id, order_id, status, changed_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, preview_id, idempotency_key, full_name, phone, address, note, total, status, created_at, version) FROM stdin;
\.


--
-- Data for Name: otp_challenges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otp_challenges (id, email, purpose, code_hash, issued_at, failed_attempts, consumed, version, deliverable) FROM stdin;
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (product_id, "position", url) FROM stdin;
1	0	/images/7a3be82fc743ac21.webp
2	0	/images/3f8cd5940d6aa104.webp
3	0	/images/d5d763a17ed65b6c.webp
4	0	/images/37610803aa06b819.webp
5	0	/images/3e9fdc9f8aac968f.webp
6	0	/images/4350531d6ae81fe8.webp
\.


--
-- Data for Name: product_specifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_specifications (product_id, spec_name, spec_value) FROM stdin;
1	Chip xử lý	Apple A18 Pro 3nm
1	RAM	8 GB
1	Màn hình	6.9 inch OLED 120Hz ProMotion
1	Camera	Chính 48 MP + Siêu rộng 48 MP + Telephoto 12 MP (Zoom 5x)
1	Pin	4.685 mAh, sạc nhanh 27W
1	Hệ điều hành	iOS 18
2	Chip xử lý	Snapdragon 8 Gen 3 for Galaxy
2	RAM	12 GB
2	Màn hình	6.8 inch Dynamic AMOLED 2X, 120Hz, 2600 nits
2	Camera	200 MP + 50 MP + 12 MP + 10 MP (Zoom 100x)
2	Pin	5.000 mAh, sạc nhanh 45W
2	Hệ điều hành	Android 14, One UI 6.1
3	Chip xử lý	Apple A18 Pro
3	RAM	8 GB
3	Màn hình	6.3 inch Super Retina XDR OLED
3	Camera	48 MP + 48 MP + 12 MP (Zoom quang 5x)
3	Pin	3.582 mAh, sạc không dây MagSafe
3	Hệ điều hành	iOS 18
4	Chip xử lý	Snapdragon 8 Gen 3 4nm
4	RAM	16 GB
4	Màn hình	6.73 inch LTPO AMOLED, 120Hz, 3000 nits
4	Camera	Bộ tứ Leica 50 MP (chính 1 inch, siêu rộng, tele 3.2x, tiềm vọng 5x)
4	Pin	5.000 mAh, sạc siêu tốc 90W
4	Hệ điều hành	Android 14, Xiaomi HyperOS
5	Chip xử lý	Snapdragon 8 Gen 3
5	RAM	16 GB
5	Màn hình	6.82 inch AMOLED LTPO 120Hz, 4500 nits đỉnh
5	Camera	4 camera 50 MP Hasselblad, 2 ống kính tiềm vọng
5	Pin	5.000 mAh, sạc SuperVOOC 100W
5	Hệ điều hành	ColorOS 14
6	Chip xử lý	MediaTek Dimensity 9300
6	RAM	16 GB
6	Màn hình	6.78 inch AMOLED 8T LTPO, 3000 nits
6	Camera	3 camera ZEISS 50 MP (Cảm biến 1 inch Sony IMX989)
6	Pin	5.400 mAh, sạc 100W FlashCharge
6	Hệ điều hành	Funtouch OS 14
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, product_id, color, storage, price, active, color_hex, image) FROM stdin;
1	1	Titan Tự Nhiên	256GB	34990000	t	#ada397	/images/7a3be82fc743ac21.webp
2	1	Titan Đen	256GB	34990000	t	#343434	/images/7a3be82fc743ac21.webp
3	1	Titan Tự Nhiên	512GB	38990000	t	#ada397	/images/7a3be82fc743ac21.webp
4	1	Titan Đen	512GB	38990000	t	#343434	/images/7a3be82fc743ac21.webp
5	1	Titan Tự Nhiên	1TB	43990000	t	#ada397	/images/7a3be82fc743ac21.webp
6	2	Titan Xám	256GB	28490000	t	#8b8a86	/images/3f8cd5940d6aa104.webp
7	2	Titan Đen	256GB	28490000	t	#343434	/images/3f8cd5940d6aa104.webp
8	2	Titan Xám	512GB	32490000	t	#8b8a86	/images/3f8cd5940d6aa104.webp
9	2	Titan Xám	1TB	37490000	t	#8b8a86	/images/3f8cd5940d6aa104.webp
10	3	Titan Sa Mạc	128GB	28990000	t	#c4a98a	/images/d5d763a17ed65b6c.webp
11	3	Titan Đen	128GB	28990000	t	#343434	/images/d5d763a17ed65b6c.webp
12	3	Titan Sa Mạc	256GB	31990000	t	#c4a98a	/images/d5d763a17ed65b6c.webp
13	3	Titan Sa Mạc	512GB	37990000	t	#c4a98a	/images/d5d763a17ed65b6c.webp
14	4	Trắng	512GB	25990000	t	#efefec	/images/37610803aa06b819.webp
15	4	Đen	512GB	25990000	t	#343434	/images/37610803aa06b819.webp
16	4	Trắng	1TB	29990000	t	#efefec	/images/37610803aa06b819.webp
17	5	Xanh Đại Dương	256GB	21990000	t	#384c6d	/images/3e9fdc9f8aac968f.webp
18	5	Nâu Sa Mạc	256GB	21990000	t	#8a6240	/images/3e9fdc9f8aac968f.webp
19	5	Xanh Đại Dương	512GB	24990000	t	#384c6d	/images/3e9fdc9f8aac968f.webp
20	6	Đen	256GB	22990000	t	#333638	/images/4350531d6ae81fe8.webp
21	6	Xanh Hoàng Hôn	256GB	22990000	t	#2d5a7b	/images/4350531d6ae81fe8.webp
22	6	Đen	512GB	25990000	t	#333638	/images/4350531d6ae81fe8.webp
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, active, brand_id, description) FROM stdin;
1	iPhone 16 Pro Max	t	1	iPhone 16 Pro Max sở hữu màn hình Super Retina XDR 6.9 inch, chip Apple A18 Pro mạnh mẽ và nút điều khiển Camera Control đột phá.
2	Galaxy S24 Ultra	t	2	Galaxy S24 Ultra mang đến quyền năng Galaxy AI vượt trội, bút S-Pen tích hợp, khung viền Titan và camera zoom quang học 200MP ấn tượng.
3	iPhone 16 Pro	t	1	iPhone 16 Pro nhỏ gọn mạnh mẽ với màn hình 6.3 inch, thời lượng pin nâng cấp, camera 48MP Fusion và sức mạnh từ chip A18 Pro.
4	Xiaomi 14 Ultra	t	3	Tuyệt tác nhiếp ảnh hợp tác cùng Leica với cụm 4 camera 50MP cảm biến 1 inch, ống kính quang học Summilux và màn hình AMOLED siêu sáng.
5	OPPO Find X7 Ultra	t	4	Flagship đầu tiên trên thế giới sở hữu camera tiềm vọng kép (Dual Periscope), hệ thống hình ảnh Hasselblad thế hệ mới và thiết kế da sang trọng.
6	vivo X100 Pro	t	5	vivo X100 Pro tích hợp thấu kính ZEISS APO đạt chuẩn chứng nhận chuyên nghiệp, chip hình ảnh V3 độc quyền và vi xử lý Dimensity 9300 đỉnh cao.
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (id, maintenance_enabled, version) FROM stdin;
1	f	0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, username, password_hash, full_name, phone, address, role, active, root_key, version, deleted) FROM stdin;
ab658ff4-7ee4-4788-8642-4f4e15746314	\N	admin	$2a$10$K/KtT6Ak.Mh3153S.kdWU.iX07ExPb0.WIRNEWgsR/6wqDSbY4bpi	Admin gốc			ADMIN	t	ROOT	0	f
\.


--
-- Data for Name: vector_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vector_store (id, content, metadata, embedding) FROM stdin;
\.


--
-- Name: ai_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_messages_id_seq', 1, false);


--
-- Name: ai_provider_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_provider_configs_id_seq', 1, false);


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.brands_id_seq', 6, false);


--
-- Name: embedding_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.embedding_configs_id_seq', 1, false);


--
-- Name: product_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_variants_id_seq', 25, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 7, false);


--
-- Name: admin_invitations admin_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_invitations
    ADD CONSTRAINT admin_invitations_pkey PRIMARY KEY (id);


--
-- Name: admin_invitations admin_invitations_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_invitations
    ADD CONSTRAINT admin_invitations_token_hash_key UNIQUE (token_hash);


--
-- Name: admin_invitations admin_invitations_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_invitations
    ADD CONSTRAINT admin_invitations_user_id_key UNIQUE (user_id);


--
-- Name: ai_conversations ai_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_pkey PRIMARY KEY (id);


--
-- Name: ai_guest_sessions ai_guest_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_guest_sessions
    ADD CONSTRAINT ai_guest_sessions_pkey PRIMARY KEY (id);


--
-- Name: ai_guest_sessions ai_guest_sessions_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_guest_sessions
    ADD CONSTRAINT ai_guest_sessions_token_hash_key UNIQUE (token_hash);


--
-- Name: ai_messages ai_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_messages
    ADD CONSTRAINT ai_messages_pkey PRIMARY KEY (id);


--
-- Name: ai_provider_configs ai_provider_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_provider_configs
    ADD CONSTRAINT ai_provider_configs_pkey PRIMARY KEY (id);


--
-- Name: ai_topic_switch_requests ai_topic_switch_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_topic_switch_requests
    ADD CONSTRAINT ai_topic_switch_requests_pkey PRIMARY KEY (id);


--
-- Name: brands brands_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_name_key UNIQUE (name);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_user_id_variant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_variant_id_key UNIQUE (user_id, variant_id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (user_id);


--
-- Name: embedding_configs embedding_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.embedding_configs
    ADD CONSTRAINT embedding_configs_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: knowledge_chunks knowledge_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_chunks
    ADD CONSTRAINT knowledge_chunks_pkey PRIMARY KEY (id);


--
-- Name: knowledge_documents knowledge_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_documents
    ADD CONSTRAINT knowledge_documents_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_preview_items order_preview_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_preview_items
    ADD CONSTRAINT order_preview_items_pkey PRIMARY KEY (id);


--
-- Name: order_preview_items order_preview_items_preview_id_variant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_preview_items
    ADD CONSTRAINT order_preview_items_preview_id_variant_id_key UNIQUE (preview_id, variant_id);


--
-- Name: order_previews order_previews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_previews
    ADD CONSTRAINT order_previews_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: orders orders_user_id_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_idempotency_key_key UNIQUE (user_id, idempotency_key);


--
-- Name: otp_challenges otp_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otp_challenges
    ADD CONSTRAINT otp_challenges_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (product_id, "position");


--
-- Name: product_specifications product_specifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT product_specifications_pkey PRIMARY KEY (product_id, spec_name);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_root_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_root_key_key UNIQUE (root_key);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: vector_store vector_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vector_store
    ADD CONSTRAINT vector_store_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_ai_conversations_guest; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_conversations_guest ON public.ai_conversations USING btree (guest_id);


--
-- Name: idx_ai_conversations_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_conversations_user ON public.ai_conversations USING btree (user_id);


--
-- Name: idx_ai_messages_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_messages_conversation ON public.ai_messages USING btree (conversation_id, id);


--
-- Name: idx_ai_provider_configs_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_provider_configs_provider ON public.ai_provider_configs USING btree (provider, id);


--
-- Name: idx_knowledge_chunks_document; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_knowledge_chunks_document ON public.knowledge_chunks USING btree (document_id);


--
-- Name: idx_otp_challenges_email_purpose; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_otp_challenges_email_purpose ON public.otp_challenges USING btree (email, purpose);


--
-- Name: idx_product_variants_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_variants_product ON public.product_variants USING btree (product_id);


--
-- Name: admin_invitations admin_invitations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_invitations
    ADD CONSTRAINT admin_invitations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ai_conversations ai_conversations_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.ai_guest_sessions(id);


--
-- Name: ai_conversations ai_conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ai_messages ai_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_messages
    ADD CONSTRAINT ai_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id);


--
-- Name: ai_topic_switch_requests ai_topic_switch_requests_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_topic_switch_requests
    ADD CONSTRAINT ai_topic_switch_requests_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id);


--
-- Name: ai_topic_switch_requests ai_topic_switch_requests_new_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_topic_switch_requests
    ADD CONSTRAINT ai_topic_switch_requests_new_conversation_id_fkey FOREIGN KEY (new_conversation_id) REFERENCES public.ai_conversations(id);


--
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.carts(user_id);


--
-- Name: cart_items cart_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);


--
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: knowledge_chunks knowledge_chunks_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_chunks
    ADD CONSTRAINT knowledge_chunks_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.knowledge_documents(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_preview_items order_preview_items_preview_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_preview_items
    ADD CONSTRAINT order_preview_items_preview_id_fkey FOREIGN KEY (preview_id) REFERENCES public.order_previews(id);


--
-- Name: order_preview_items order_preview_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_preview_items
    ADD CONSTRAINT order_preview_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);


--
-- Name: order_previews order_previews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_previews
    ADD CONSTRAINT order_previews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: orders orders_preview_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_preview_id_fkey FOREIGN KEY (preview_id) REFERENCES public.order_previews(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_specifications product_specifications_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT product_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ByAFhtBBUFNjID1JWCVSxnCHEkNRrfw3aQUZHuKKRrtyeVPx4YJsmatwEHWqUIc

