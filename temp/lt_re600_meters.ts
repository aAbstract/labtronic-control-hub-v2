enum LTRE600ScreenMode {
    W1280 = 1,
    W1920 = 2,
};

interface DiagramTextFieldParams {
    dtf_name: string;
    top_offsets: Record<LTRE600ScreenMode, number>;
    left_offsets: Record<LTRE600ScreenMode, number>;
};

const dtfs: DiagramTextFieldParams[] = [
    // m1    
    {
        dtf_name: 'm1_output',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 65,
            [LTRE600ScreenMode.W1920]: 100,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 465,
            [LTRE600ScreenMode.W1920]: 715,
        },
    },

    // m2
    {
        dtf_name: 'm2_v',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 431,
            [LTRE600ScreenMode.W1920]: 662,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 800,
            [LTRE600ScreenMode.W1920]: 1225,
        },
    },
    {
        dtf_name: 'm2_i',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 431,
            [LTRE600ScreenMode.W1920]: 662,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 885,
            [LTRE600ScreenMode.W1920]: 1355,
        },
    },
    {
        dtf_name: 'm2_p',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 431,
            [LTRE600ScreenMode.W1920]: 662,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 980,
            [LTRE600ScreenMode.W1920]: 1500,
        },
    },

    // m3
    {
        dtf_name: 'm3_v',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 455,
            [LTRE600ScreenMode.W1920]: 698,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 206,
            [LTRE600ScreenMode.W1920]: 315,
        },
    },
    {
        dtf_name: 'm3_i',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 455,
            [LTRE600ScreenMode.W1920]: 698,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 291,
            [LTRE600ScreenMode.W1920]: 445,
        },
    },
    {
        dtf_name: 'm3_p',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 455,
            [LTRE600ScreenMode.W1920]: 698,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 386,
            [LTRE600ScreenMode.W1920]: 590,
        },
    },

    // m4
    {
        dtf_name: 'm4_v',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 193,
            [LTRE600ScreenMode.W1920]: 297,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 767,
            [LTRE600ScreenMode.W1920]: 1174
            ,
        },
    },
    {
        dtf_name: 'm4_i',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 193,
            [LTRE600ScreenMode.W1920]: 297,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 852,
            [LTRE600ScreenMode.W1920]: 1305,
        },
    },
    {
        dtf_name: 'm4_p',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 193,
            [LTRE600ScreenMode.W1920]: 297,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 947,
            [LTRE600ScreenMode.W1920]: 1450,
        },
    },

    // m5
    {
        dtf_name: 'm5_speed',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 276,
            [LTRE600ScreenMode.W1920]: 423,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 300,
            [LTRE600ScreenMode.W1920]: 462,
        },
    },
];
const lt_re600_meters = {
    'm1_output': 0,

    'm2_v': 0,
    'm2_i': 0,
    'm2_p': 0,

    'm3_v': 0,
    'm3_i': 0,
    'm3_p': 0,

    'm4_v': 0,
    'm4_i': 0,
    'm4_p': 0,

    'm5_speed': 0,
};

// .dt_tf {
//     position: absolute;
//     width: v-bind(dtf_width);
//     color: var(--font-color);
//     border: none;
//     background-color: var(--light-bg-color);
//     /* background-color: transparent; */
//     font-size: v-bind(dtf_font_size);
//     font-weight: bold;
//     padding: 4px;
//     border: 1px solid var(--accent-color);
//     border-radius: 2px;
//     cursor: default;
// }

// .dt_tf:focus {
//     outline: none;
// }

// const dtf_font_size = computed(() => {
//     if (lt_re600_screen_mode.value === LT_RE600_ScreenMode.W1280)
//         return '16px';
//     else if (lt_re600_screen_mode.value === LT_RE600_ScreenMode.W1920)
//         return '28px';
//     else
//         return '16px';
// });
// const dtf_width = computed(() => {
//     if (lt_re600_screen_mode.value === LT_RE600_ScreenMode.W1280)
//         return '64px';
//     else if (lt_re600_screen_mode.value === LT_RE600_ScreenMode.W1920)
//         return '95px';
//     else
//         return '64px';
// });