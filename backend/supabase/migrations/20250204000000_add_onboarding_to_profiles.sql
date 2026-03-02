-- Add onboarding fields to profiles so we know when a user has completed the survey
-- and can store their answers for personalized budget/overspend behavior.

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists onboarding_answers jsonb default '{}';

comment on column public.profiles.onboarding_completed_at is 'Set when user completes the first-time onboarding survey';
comment on column public.profiles.onboarding_answers is 'JSON object of survey question ids to answers for personalization';
