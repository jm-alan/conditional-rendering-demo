const SHOW = 'login/SHOW';

const HIDE = 'login/HIDE';

export const ShowLogin = () => ({ type: SHOW });

export const HideLogin = () => ({ type: HIDE });

export default function reducer (
  state = { display: false },
  action
) {
  switch (action.type) {
    case SHOW:
      return { ...state, display: true };
    case HIDE:
      return { ...state, display: false };
    default:
      return state;
  }
}
