-- =====================================================
-- NFC WALLET - ESQUEMA DO BANCO DE DADOS
--
-- Execute este arquivo no Supabase:
-- SQL Editor -> New Query -> colar -> Run
-- =====================================================


-- =====================================================
-- PERFIS
-- =====================================================

create table if not exists public.perfis (
    id uuid primary key references auth.users (id) on delete cascade,
    nome text not null default 'Usuário NFC',
    criada_em timestamptz not null default now()
);


-- =====================================================
-- TAGS NFC
-- =====================================================

create table if not exists public.tags_nfc (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references auth.users (id) on delete cascade,
    nome text not null default 'Tag NFC',
    tag_id text not null,
    descricao text,
    publica boolean not null default false,
    criada_em timestamptz not null default now(),
    atualizada_em timestamptz not null default now(),
    constraint tags_nfc_usuario_tag_unica unique (usuario_id, tag_id)
);

create index if not exists tags_nfc_usuario_id_idx
    on public.tags_nfc (usuario_id, criada_em desc);

create index if not exists tags_nfc_publica_idx
    on public.tags_nfc (publica)
    where publica;


-- =====================================================
-- LEITURAS NFC
-- =====================================================

create table if not exists public.leituras_nfc (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references auth.users (id) on delete cascade,
    tag_id uuid not null references public.tags_nfc (id) on delete cascade,
    dispositivo text,
    lida_em timestamptz not null default now()
);

create index if not exists leituras_nfc_usuario_id_idx
    on public.leituras_nfc (usuario_id, lida_em desc);


-- =====================================================
-- ATUALIZAÇÃO AUTOMÁTICA DE atualizada_em
-- =====================================================

create or replace function public.definir_atualizada_em()
returns trigger
language plpgsql
as $$
begin
    new.atualizada_em := now();
    return new;
end;
$$;

drop trigger if exists tags_nfc_atualizada_em on public.tags_nfc;

create trigger tags_nfc_atualizada_em
    before update on public.tags_nfc
    for each row
    execute function public.definir_atualizada_em();


-- =====================================================
-- CRIAÇÃO AUTOMÁTICA DO PERFIL NO CADASTRO
-- =====================================================

create or replace function public.criar_perfil_do_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.perfis (id, nome)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'nome', 'Usuário NFC')
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists criar_perfil_apos_cadastro on auth.users;

create trigger criar_perfil_apos_cadastro
    after insert on auth.users
    for each row
    execute function public.criar_perfil_do_usuario();


-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.perfis enable row level security;
alter table public.tags_nfc enable row level security;
alter table public.leituras_nfc enable row level security;


-- PERFIS ----------------------------------------------

drop policy if exists "perfis_selecionar_proprio" on public.perfis;
create policy "perfis_selecionar_proprio"
    on public.perfis for select
    using (auth.uid() = id);

drop policy if exists "perfis_inserir_proprio" on public.perfis;
create policy "perfis_inserir_proprio"
    on public.perfis for insert
    with check (auth.uid() = id);

drop policy if exists "perfis_atualizar_proprio" on public.perfis;
create policy "perfis_atualizar_proprio"
    on public.perfis for update
    using (auth.uid() = id)
    with check (auth.uid() = id);


-- TAGS NFC --------------------------------------------

drop policy if exists "tags_selecionar_proprias" on public.tags_nfc;
create policy "tags_selecionar_proprias"
    on public.tags_nfc for select
    using (auth.uid() = usuario_id);

-- Permite que a página pública (tag.html) leia apenas tags públicas,
-- inclusive para visitantes anônimos.
drop policy if exists "tags_selecionar_publicas" on public.tags_nfc;
create policy "tags_selecionar_publicas"
    on public.tags_nfc for select
    using (publica);

drop policy if exists "tags_inserir_proprias" on public.tags_nfc;
create policy "tags_inserir_proprias"
    on public.tags_nfc for insert
    with check (auth.uid() = usuario_id);

drop policy if exists "tags_atualizar_proprias" on public.tags_nfc;
create policy "tags_atualizar_proprias"
    on public.tags_nfc for update
    using (auth.uid() = usuario_id)
    with check (auth.uid() = usuario_id);

drop policy if exists "tags_excluir_proprias" on public.tags_nfc;
create policy "tags_excluir_proprias"
    on public.tags_nfc for delete
    using (auth.uid() = usuario_id);


-- LEITURAS NFC ----------------------------------------

drop policy if exists "leituras_selecionar_proprias" on public.leituras_nfc;
create policy "leituras_selecionar_proprias"
    on public.leituras_nfc for select
    using (auth.uid() = usuario_id);

drop policy if exists "leituras_inserir_proprias" on public.leituras_nfc;
create policy "leituras_inserir_proprias"
    on public.leituras_nfc for insert
    with check (auth.uid() = usuario_id);

drop policy if exists "leituras_excluir_proprias" on public.leituras_nfc;
create policy "leituras_excluir_proprias"
    on public.leituras_nfc for delete
    using (auth.uid() = usuario_id);
