# Supabase Setup Permissions

To allow users to sign up and log in immediately without email verification:

1.  **Go to your Supabase Dashboard** (https://supabase.com/dashboard/project/yzdrknzzutlznswjrzqa).
2.  Click on **Authentication** icon (left sidebar).
3.  Click on **Providers** (under Configuration).
4.  Click on **Email** to expand the settings.
5.  **Disable** (toggle off) the setting: **"Confirm email"**.
6.  Click **Save**.

Once this is unchecked, new users will be logged in immediately after signing up!

## For Existing "Unconfirmed" Users
If you created a user while this setting was On, they are stuck in "waiting for verification".
-   Go to **Authentication** > **Users**.
-   Delete the unconfirmed user.
-   Sign up again in the app.
