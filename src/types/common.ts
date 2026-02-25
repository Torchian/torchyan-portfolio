import type { ReactNode } from 'react';

export type WithChildren<T = object> = T & { children?: ReactNode };

export type PropsWithAs<
  DefaultElement extends React.ElementType,
  Props = object,
> = Props & {
  as?: React.ElementType;
} & Omit<React.ComponentPropsWithoutRef<DefaultElement>, keyof Props | 'as'>;
