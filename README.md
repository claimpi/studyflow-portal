# StudyFlowHQ Portal

Academic portal management service. Students enroll their university portal and a dedicated manager handles all assignments, submissions and deadlines.

## Stack
- Next.js 14 (App Router, TypeScript)
- Supabase (PostgreSQL + RLS + Storage)
- Resend (emails)
- Google OAuth

## Pages
| Route | Description |
|---|---|
| `/` | Homepage — pitch, pricing, FAQ |
| `/onboarding` | 4-step secure credential intake |
| `/auth/login` | Google sign-in |
| `/dashboard` | Student portal — enrollments + task tracking |
| `/admin` | Admin portal — manage all clients + tasks |

## Setup
1. `npm install`
2. Copy `.env.example` → `.env.local` and fill in values
3. Create new Supabase project
4. Run `supabase/migrations/001_schema.sql` in SQL Editor
5. Enable Google auth in Supabase → Authentication → Providers
6. `npm run dev`

## Make yourself admin
```sql
update public.profiles set role = 'admin' where email = 'assignmentexperthelper@gmail.com';
```
