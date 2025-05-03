create or replace view auth_users_view as select id, email, email_confirmed_at, last_sign_in_at from auth.users; grant select on auth_users_view to authenticated;
