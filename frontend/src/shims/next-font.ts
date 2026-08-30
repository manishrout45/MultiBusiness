interface FontOptions {
  variable?: string;
  subsets?: string[];
  weight?: string | string[];
}

function dummyFont(options: FontOptions = {}) {
  return {
    className: '',
    variable: options.variable ?? '',
    style: {},
  };
}

export const Plus_Jakarta_Sans = dummyFont;
export const Geist_Mono = dummyFont;
export const Geist = dummyFont;
export const Inter = dummyFont;
