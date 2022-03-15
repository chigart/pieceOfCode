import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import FormBorder from '@/components/_Common/Form/Border';
import styles from '../PersonalProgramsForm.module.scss';
import AddIcon from '@/public/images/symbols/add.svg';
import { useRouter } from 'next/router';
import ButtonCustom from '@/components/_Common/ButtonCustom';
import PersonalProgramsItem from '@/components/Personal/Programs/Item';
import { DragDropContext, Droppable, Draggable, DropResult, resetServerContext } from 'react-beautiful-dnd';
import DictionaryService from '@/lib/services/dictionary.service';
import UserService from '@/lib/services/user.service';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { useDispatch } from 'react-redux';
import { NextThunkDispatch } from '@/store/index';
import { fetchChosenPrograms, getDictionaries } from '@/store/action/formActions';

const PersonalProgramsForm: React.FC = (): JSX.Element => {
  const router = useRouter();
  const { t } = useTranslation('personal/programs');
  const { studentDetailActive, user } = useTypedSelector(state => state.user);
  const { chosenPrograms } = useTypedSelector(state => state.form);
  const dispatch = useDispatch() as NextThunkDispatch;
  const [programs, setPrograms] = useState<ISelectedProgram[]>([]);
  const [isDragDisabled, setIsDragDisabled] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const financing = await DictionaryService.getFinancing(location.origin);
      const admissionConditions = await DictionaryService.getAdmissionConditions(location.origin);
      dispatch(getDictionaries({ financing, admissionConditions }));
    };
    getData();
  }, []);

  useEffect(() => {
    setPrograms(chosenPrograms);
  }, [chosenPrograms]);

  const deleteProgram = async (id : string, competitiveGroupId?: string) => {
    const programToDelete = competitiveGroupId ?
      programs?.find((item) => item.program.id === id && item?.competitiveGroup?.id === competitiveGroupId) :
      programs?.find((item) => item.program.id === id);
    if (programToDelete && programToDelete.id) {
      await UserService.deleteUserPrograms(user.id, studentDetailActive.id, programToDelete?.id).then(() => {
        dispatch(fetchChosenPrograms(user.id, studentDetailActive.id, location.origin));
      });
    }
  };

  const changePriority = async (programs: ISelectedProgram[]) => {
    const reorderedPrograms =  programs.map((program, index) => {
      return { ...program, priority: index + 1 };
    });
    await UserService.updateUserPrograms(user.id, studentDetailActive.id, { selected_programs: reorderedPrograms })
      .then(() => {
        dispatch(fetchChosenPrograms(user.id, studentDetailActive.id, location.origin));
      });
  };

  const setFinancing = async (id : string, financing : string) => {
    await UserService.changeFinancing(user.id, studentDetailActive.id, id, financing).then(() => {
      dispatch(fetchChosenPrograms(user.id, studentDetailActive.id, location.origin));
    });
  };

  const setAdmissionCondition = async (id : string, admissionCondition: string) => {
    await UserService.changeAdmissionCondition(user.id, studentDetailActive.id, id, admissionCondition).then(() => {
      dispatch(fetchChosenPrograms(user.id, studentDetailActive.id, location.origin));
    });
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(programs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPrograms(items);
    changePriority(items);
  };

  resetServerContext();

  return (
    <>
      <p className='mb-0'>
        { t('description.one.text') }
        <b>{ t('description.one.accent') }</b>
      </p>
      <p className='mb-4'>
        { t('description.two.text') }
        <b>{ t('description.two.accent') }</b>
      </p>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="programs">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {programs?.map(({ id, program, competitiveGroup, financing, admissionCondition }, index) => {
                return (
                  <div key={id}>
                    <Draggable
                      isDragDisabled={isDragDisabled}
                      key={id}
                      draggableId={'program' + id}
                      index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? styles.dragging : ''}
                        >
                          <PersonalProgramsItem
                            key={id}
                            priority={snapshot.isDragging ? 0 : index+1}
                            name={program.titleRu}
                            code={competitiveGroup?.title ?? ''}
                            id={id}
                            financing={financing || ''}
                            admissionCondition={admissionCondition || ''}
                            deleteProgram={() => deleteProgram(program.id, competitiveGroup?.id)}
                            setFinancing={setFinancing}
                            setAdmissionCondition={setAdmissionCondition}
                            setIsDragDisabled={setIsDragDisabled}
                          />
                        </div>
                      )}
                    </Draggable>
                    <div className={styles.separator} />
                  </div>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <ButtonCustom
        size='lg'
        Icon={AddIcon}
        iconPosition='left'
        variant='outline-primary'
        onClick={() => router.push('/programs')}
        className='btn-add'
      >
        {t('button')}
      </ButtonCustom>

      <FormBorder />
    </>
  );
};

export default PersonalProgramsForm;
