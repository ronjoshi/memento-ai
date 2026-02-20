alter table "public"."memories" drop column "tag";

alter table "public"."memories" add column "tag_ids" bigint[];

alter table "public"."tags" add column "color" text default 'gray'::text;

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
