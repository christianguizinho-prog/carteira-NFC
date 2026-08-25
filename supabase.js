import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL =
    "https://ojbzshcwuqkzlvqwybxh.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_8o9mtbdQmr6x8jBG699i9g_6JNkcGFC";

export const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );