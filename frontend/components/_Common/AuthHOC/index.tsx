import { GetServerSidePropsContext, GetStaticPropsResult, NextApiRequest } from 'next';
import { axios } from '@/lib/axios';
import absoluteUrl from 'next-absolute-url';
import { isDev, serverLink } from '@/lib/config';
import nookies from 'nookies';
import AuthService from '@/lib/services/auth.service';
import UserService from '@/lib/services/user.service';
import DictionaryService, { IDictionaryItem } from '@/lib/services/dictionary.service';
import { AnyAction, CombinedState, Store } from 'redux';
import { NextThunkDispatch } from '@/store/';
import { fetchChosenPrograms, fetchSidebar } from '@/store/action/formActions';
import {
  setDegreeList,
  setStudentDetailActive,
  setStudentDetails,
  setUser,
  setTheme,
  setAccessibleSettings,
} from '@/store/action/userActions';

type PropsType = {
  regions?: IDictionaryItem[];
  areas?: IDictionaryItem[];
  cities?: IDictionaryItem[];
  streets?: IDictionaryItem[];
}

export const requireAuthentication = async (context:GetServerSidePropsContext & { store: Store<CombinedState<{ auth: IAuthState; form: IFormData; user: IUserState }>, AnyAction>; }): Promise<GetStaticPropsResult<PropsType>> => {
  const dispatch = context.store.dispatch as NextThunkDispatch;

  const req = context.req as NextApiRequest;
  const accessToken = req.cookies?.access_token;
  const refreshToken = req.cookies?.refresh_token;
  const theme = req.cookies?.theme as ITheme;
  const accessibleSettings = req.cookies?.accessibleSettings && JSON.parse(req.cookies?.accessibleSettings) as IAccessibleSettings;

  let
    result,
    host = ''
  ;

  const removeToken = () => {
    nookies.destroy(context, 'access_token', {
      path: '/',
    });
    nookies.destroy(context, 'refresh_token', {
      path: '/',
    });

    return {
      redirect: {
        permanent: false,
        destination: '/login',
      },
    };
  };

  if (req) {
    const { origin } = absoluteUrl(req);
    host = isDev ? serverLink : origin;
  }

  if (!accessToken) {
    if (refreshToken) {
      result = await AuthService.refreshTokenAction(refreshToken, host);
    }
  }

  if (!result && !accessToken) {
    return removeToken();
  }

  const token = accessToken ? accessToken : (result ? result.access_token : undefined);

  if (token) {
    axios.defaults.headers.common['X-Authorization'] = `Bearer ${token}`;

    if (result) {
      nookies.set(context, 'access_token', token, {
        maxAge: result.expires_in,
        path: '/',
        secure: !isDev,
      });
      nookies.set(context, 'refresh_token', result.refresh_token, {
        maxAge: result.expires_in,
        path: '/',
        secure: !isDev,
      });
    }
  }

  const user = await UserService.getProfile(host);

  if (!user) {
    return removeToken();
  }

  const studentDetails = await UserService.getStudentDetails(host, user.id);
  const studentDetailActive = await UserService.getStudentDetailActive(host, user.id);

  dispatch(setStudentDetailActive(studentDetailActive));
  dispatch(setStudentDetails(studentDetails));
  dispatch(setDegreeList(await DictionaryService.getDegrees(host)));
  dispatch(setUser(user));
  await dispatch(fetchSidebar(user.id, studentDetailActive.id, studentDetailActive.degree, host));
  await dispatch(fetchChosenPrograms(user.id, studentDetailActive.id, host));

  if (theme) dispatch(setTheme(theme));
  if (accessibleSettings) dispatch(setAccessibleSettings(accessibleSettings));

  return {
    props: {},
  };
};
