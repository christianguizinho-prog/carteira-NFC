import { createClient } from
    "";

const SUPABASE_URL =
    "";

const SUPABASE_KEY =
    "sb_publishable_8o9mtbdQmr6x8jBG699i9g_6JNkcGFC";

export const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );