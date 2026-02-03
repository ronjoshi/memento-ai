create extension if not exists "vector" with schema "extensions";

drop policy "Enable delete for users based on user_id" on "public"."memories";

drop policy "Enable insert for users based on user_id" on "public"."memories";

drop policy "Enable users to view their own data only" on "public"."memories";

drop policy "Enable delete for users based on user_id" on "public"."tags";

drop policy "Enable insert for users based on user_id" on "public"."tags";

drop policy "Enable users to view their own data only" on "public"."tags";

alter table "public"."memories" add column if not exists "embedding" extensions.vector(1536);

alter table "public"."memories" add column "fts" tsvector generated always as (to_tsvector('english'::regconfig, memory_data)) stored;

alter table "public"."memories" alter column "created_at" drop default;

alter table "public"."memories" alter column "created_at" drop not null;

alter table "public"."memories" alter column "created_at" set data type timestamp without time zone using "created_at"::timestamp without time zone;

alter table "public"."memories" alter column "user_id" drop default;

alter table "public"."memories" disable row level security;

alter table "public"."tags" disable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.hybrid_memory_search(query_text text, query_embedding extensions.vector, match_count integer, input_user_id uuid, start_time timestamp without time zone DEFAULT NULL::timestamp without time zone, end_time timestamp without time zone DEFAULT NULL::timestamp without time zone, full_text_weight double precision DEFAULT 1, semantic_weight double precision DEFAULT 1, rrf_k integer DEFAULT 50)
 RETURNS SETOF public.memories
 LANGUAGE sql
AS $function$with full_text as (
  select
    id,
    row_number() over(order by ts_rank_cd(fts, websearch_to_tsquery('english', query_text)) desc) as rank_ix
  from
    memories
  where
    fts @@ websearch_to_tsquery('english', query_text)
    and user_id = input_user_id
    and (start_time is null or created_at >= start_time)
    and (end_time is null or created_at <= end_time)
  order by rank_ix
  limit least(match_count, 30) * 2
),
semantic as (
  select
    id,
    row_number() over (order by embedding <#> query_embedding) as rank_ix
  from
    memories
  where 
    user_id = input_user_id
    -- HARDCODED THRESHOLD: Only vectors with similarity > 0.5
    -- (using negative inner product <#> which is standard for normalized vectors)
    and (embedding <#> query_embedding) * -1 > 0.5
    and (start_time is null or created_at >= start_time)
    and (end_time is null or created_at <= end_time)
  order by rank_ix
  limit least(match_count, 30) * 2
)
select
  memories.*
from
  full_text
  full outer join semantic
    on full_text.id = semantic.id
  join memories
    on coalesce(full_text.id, semantic.id) = memories.id
order by
  coalesce(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
  coalesce(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight
  desc
limit
  least(match_count, 30)$function$
;

grant delete on table "public"."memories" to "postgres";

grant insert on table "public"."memories" to "postgres";

grant references on table "public"."memories" to "postgres";

grant select on table "public"."memories" to "postgres";

grant trigger on table "public"."memories" to "postgres";

grant truncate on table "public"."memories" to "postgres";

grant update on table "public"."memories" to "postgres";


