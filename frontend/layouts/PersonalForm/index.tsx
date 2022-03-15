import React, { useContext } from 'react';
import DefaultLayout from '@/layouts/Default';
import { Col, Container } from 'react-bootstrap';
import ButtonCustom from '@/components/_Common/ButtonCustom';
import ArrowLeft from '@/public/images/symbols/left.svg';
import ArrowRight from '@/public/images/symbols/right.svg';
import styles from './PersonalForm.module.scss';
import Sidebar from '@/layouts/_Common/Sidebar';
import { useRouter } from 'next/router';
import CollectionHint from '@/layouts/_Common/CollectionHint';
import Check from '@/public/images/symbols/check.svg';
import useTranslation from 'next-translate/useTranslation';
import { AuthContext } from '@/context/AuthPageContext';
import uniteSingleChars from '@/lib/_common/uniteSingleChars';
import clsx from 'clsx';
import Link from '@/components/_Common/Link';
import returnUrl from '@/lib/_common/returnUrl';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import SidebarModal from '@/layouts/_Common/Sidebar/Modal';
import CollectionChecked from '@/layouts/_Common/CollectionChecked';

type PersonalFormType = {
  heading: string;
  form: string;
  hint?: string;
  containerWidthXl?: number;
  loading?: boolean;
  disabledSendBtn?: boolean;
};

const PersonalFormLayout: React.FC<PersonalFormType> = (props): JSX.Element => {
  const { heading, children, form, hint, loading = false, containerWidthXl = 6, disabledSendBtn } = props;
  const router = useRouter();
  const path = router.pathname;
  const { t } = useTranslation('layouts/personalForm');
  const { setSubmitState } = useContext(AuthContext);
  const { studentDetailActive, theme } = useTypedSelector(state => state.user);
  const { degree, locked: disabled } = studentDetailActive;

  return (
    <DefaultLayout>
      <SidebarModal/>
      <Container className={styles.container}>
        <Col
          xl={3}
          lg={4}
          className={clsx(styles.grid__left, theme === 'accessible' && 'd-none')}
        >
          <Sidebar/>
        </Col>
        <Col
          xl={theme === 'accessible' ? 12 : containerWidthXl}
          lg={theme === 'accessible' ? 12 : 8}
          xs={12}
          className={styles.grid__middle}
        >
          { heading && (
            <h1 className={styles.heading}>
              { uniteSingleChars(heading) }
            </h1>
          )}

          { hint && (
            <div className={clsx(theme !== 'accessible' && 'd-xl-none')}>
              <CollectionHint type={hint}/>
            </div>
          )}

          {disabled && <CollectionChecked/>}

          <div className='d-flex flex-column mb-5'>
            { children }

            <div className={path !== '/personal/documents' ? 'd-flex align-items-center justify-content-between mb-5' : 'mb-3'}>
              {path !== '/personal/data' && path !== '/personal/programs' && path !== '/personal/documents' &&
                <ButtonCustom
                  size='lg'
                  Icon={ArrowLeft}
                  iconPosition='left'
                  variant='outline-primary'
                  rounded={true}
                  className={styles.btn__prev}
                  onClick={() => router.push(returnUrl(path, degree, 'prev'))}
                >
                  { t('buttons.prev') }
                </ButtonCustom>
              }

              <ButtonCustom
                type={path !== '/personal/documents' ? 'submit' : 'button'}
                form={form}
                size='lg'
                Icon={path !== '/personal/documents' ? ArrowRight : Check}
                iconPosition={path !== '/personal/documents' ? 'right' : 'left'}
                variant='primary'
                rounded={true}
                className={styles.btn__next}
                onClick={() => {
                  if(path == '/personal/achievements'){
                    router.push('/personal/documents');
                  } else if (path == '/personal/programs'){
                    router.push('/personal/data');
                  } else {
                    (path !== '/personal/programs') ?
                      () => setSubmitState && setSubmitState('check') :
                      () => router.push(returnUrl(path, degree, 'next'));
                  }
                }
                }
                disabled={disabled || loading || disabledSendBtn}
              >
                {(path === '/personal/documents' || path === '/personal/payment') ?  t('send') : t('buttons.next')}
              </ButtonCustom>
            </div>

            {path == '/personal/documents' &&
              <div className="mb-5">
                <p className={styles.processing}>
                  {t('processing.text.one')}
                  <Link href='/documents/personal_data_policy.pdf' target='_blank' className='link_policies'>
                    {t('processing.label.one')}
                  </Link>
                  {t('processing.text.two')}
                  <Link href='#' target='_blank' className='link_policies'>
                    {t('processing.label.two')}
                  </Link>
                </p>
              </div>
            }

          </div>
        </Col>

        {containerWidthXl < 9 &&
          <Col xl={9-containerWidthXl} className={clsx(styles.grid__right, theme !== 'accessible' && 'd-xl-block')}>
            { hint && (
              <CollectionHint type={hint}/>
            )}
          </Col>
        }

      </Container>
    </DefaultLayout>
  );
};

export default PersonalFormLayout;
