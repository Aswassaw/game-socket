import { Fragment } from "react";
import PreventRender from "./PreventRender";
import Countdown, { CountdownRenderProps } from "react-countdown";

interface GameTimerInterface {
  key: string;
  time: number;
  end: () => void;
  render: (countdown: CountdownRenderProps) => JSX.Element;
}

function GameTimer(props: GameTimerInterface) {
  return (
    <Fragment>
      <Countdown
        key={props.key}
        date={Date.now() + props.time * 1000} // 60 detik
        renderer={props.render}
        onComplete={props.end}
      />
    </Fragment>
  );
}

export default PreventRender(GameTimer);
