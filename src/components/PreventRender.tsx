/* eslint-disable @typescript-eslint/ban-types */
import { memo, ComponentType } from "react";

const PreventRender = <P extends {}>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> =>
  memo(
    (props) => <WrappedComponent {...(props as P)} />,
    () => true
  );

export default PreventRender;
