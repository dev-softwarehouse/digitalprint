import { IUser } from "../../../models";

const FETCHING_USER = 'FETCHING_USER';
const FETCHING_USER_FAILURE = 'FETCHING_USER_FAILURE';
const FETCHING_USER_SUCCESS = 'FETCHING_USER_SUCCESS';

const initialUserState: IUser = {
    userID: "",
    firstname: "",
    'super': false,
};

export const user = (state = initialUserState, action: any) => {
  switch (action.type) {
    case FETCHING_USER:
        return {
            ...state,
            userID: "",
            name: "",
            super: false,
        };
    case FETCHING_USER_FAILURE:
        return {
            ...state,
            userID: "",
            name: "",
            super: false,
        };
      case FETCHING_USER_SUCCESS:
        return {
            ...state,
            userID: action.user.userID,
            name: action.user.firstname,
            super: action.user.super,
        };
    default :
      return {
          ...state,
          userID: "",
          name: "",
          super: false,
      }
  }
};