import React, { useState, useEffect } from 'react';
import styles from '../PersonalProgramsForm.module.scss';
import RemoveIcon from '@/public/images/symbols/delete.svg';
import Drag from '@/public/images/symbols/drag.svg';
import useTranslation from 'next-translate/useTranslation';
import FinancingModal from '@/layouts/_Common/ModalItems/Financing';
import ConditionsModal from '@/layouts/_Common/ModalItems/Conditions';
import clsx from 'clsx';
import { useTypedSelector } from '@/hooks/useTypedSelector';

type ProgramsItemProps = {
  priority: number,
  name: string,
  code: string,
  id: string,
  financing: string,
  admissionCondition: string,
  deleteProgram: (id: string) => void,
  setFinancing: (id: string, val: string) => void,
  setAdmissionCondition: (id: string, val: string) => void,
  setIsDragDisabled: (val: boolean) => void,
}

const PersonalProgramsItem: React.FC<ProgramsItemProps> = (props): JSX.Element => {
  const {
    priority,
    name,
    code,
    id,
    financing,
    admissionCondition,
    deleteProgram,
    setFinancing,
    setAdmissionCondition,
    setIsDragDisabled,
  } = props;
  const { t } = useTranslation('personal/programs');
  const [modalOpen, setModalOpen] = useState('');
  const { theme } = useTypedSelector(state => state.user);
  const { dictionaries } = useTypedSelector(state => state.form);
  const [financingLabel, setFinancingLabel] = useState<string>( t('choose') );
  const [admissionConditionLabel, setAdmissionConditionLabel] = useState<string>( t('choose') );

  useEffect(() => {
    const body = document.body;
    if (modalOpen !== '') {
      body.classList.add('noScroll');
      setIsDragDisabled(true);
      if (modalOpen === 'financing') {
        setModalOpen('financingOpen');
      }
      if (modalOpen === 'conditions') {
        setModalOpen('conditionsOpen');
      }
    }
    else body.classList.remove('noScroll');
  }, [modalOpen]);

  useEffect(() => {
    setFinancingLabel((dictionaries as IProgramsDictionaries)?.financing?.find((item) =>
      item.value === financing)?.label || t('choose'));
    setAdmissionConditionLabel((dictionaries as IProgramsDictionaries)?.admissionConditions?.find((item) =>
      item.value === admissionCondition)?.label || t('choose'));
  }, [financing, admissionCondition, dictionaries]);

  return (
    <>
      {modalOpen === 'financingOpen' &&
        <FinancingModal
          name={name}
          code={code}
          closeModal={() => {
            setModalOpen('');
            setIsDragDisabled(false);
          }}
          setFinancing={setFinancing}
          id={id}
        />
      }
      {modalOpen === 'conditionsOpen' &&
        <ConditionsModal
          name={name}
          code={code}
          closeModal={() => {
            setModalOpen('');
            setIsDragDisabled(false);
          }}
          setAdmissionCondition={setAdmissionCondition}
          id={id}
        />
      }

      <div className={clsx(styles.card, theme === 'accessible' && styles.card_accessible)}>
        <span className={styles.card__remove} onClick={() => deleteProgram(id)}>
          <RemoveIcon className={styles.card__remove__icon}/>
        </span>
        <Drag className={styles.card__drag}/>
        <div className={styles.card__top}>
          <p className='mb-2'>
            <span className={styles.card__priority}>
              { t('priority') }
              <span className={priority === 0 ? styles.card__priority_hidden : ''}>
                {' ' + priority}
              </span>
            </span>
          </p>
          <h3 className={styles.card__name}>{name}</h3>
          <p className={styles.card__code}>{code}</p>
        </div>
        <div className={styles.card__bottom}>
          <p className={styles.card__selects}>
            { t('financing') }
            <u className={styles.card__selects__link} onClick={() => setModalOpen('financing')}>
              { financingLabel }
            </u>
            { t('conditions') }
            <u className={styles.card__selects__link} onClick={() => setModalOpen('conditions')}>
              { admissionConditionLabel }
            </u>
          </p>
        </div>
      </div>
    </>

  );
};

export default PersonalProgramsItem;
