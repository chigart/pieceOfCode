import React from 'react';
import { wrapper } from '@/store/index';
import { NextPage } from 'next';
import PersonalFormLayout from '@/layouts/PersonalForm';
import useTranslation from 'next-translate/useTranslation';
import { requireAuthentication } from '@/components/_Common/AuthHOC';
import AuthPageContext from '@/context/AuthPageContext';
import PersonalProgramsForm from '@/components/Personal/Programs/Form';

const PersonalPrograms: NextPage= (): JSX.Element => {
  const { t } = useTranslation('personal/programs');
  const formID = 'PersonalProgramsForm';

  return (
    <AuthPageContext value={{ type: 'personal area' }} >
      <PersonalFormLayout
        heading={t('heading')}
        form={formID}
        containerWidthXl={9}
      >
        <PersonalProgramsForm />
      </PersonalFormLayout>
    </AuthPageContext>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(requireAuthentication);

export default PersonalPrograms;
