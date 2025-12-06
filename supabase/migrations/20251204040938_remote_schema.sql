
  create policy "Enable delete for users based on user_id"
  on "public"."memories"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for users based on user_id"
  on "public"."memories"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable users to view their own data only"
  on "public"."memories"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable delete for users based on user_id"
  on "public"."tags"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for users based on user_id"
  on "public"."tags"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable users to view their own data only"
  on "public"."tags"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



