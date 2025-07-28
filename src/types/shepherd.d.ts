declare module 'shepherd.js' {
  export interface ShepherdStep {
    id: string;
    title?: string;
    text?: string;
    classes?: string;
    scrollTo?: boolean;
    cancelIcon?: {
      enabled: boolean;
    };
    attachTo?: {
      element: string;
      on: string;
    };
    buttons?: {
      text: string;
      action: () => void;
    }[];
    when?: {
      show?: () => void;
      hide?: () => void;
      complete?: () => void;
      cancel?: () => void;
      destroy?: () => void;
    };
  }

  export interface ShepherdTourOptions {
    useModalOverlay?: boolean;
    defaultStepOptions?: Partial<ShepherdStep>;
  }

  class TourClass {
    constructor(options: ShepherdTourOptions);
    addStep(step: ShepherdStep): this;
    addSteps(steps: ShepherdStep[]): this;
    start(): void;
    next(): void;
    back(): void;
    complete(): void;
  }

  interface ShepherdStatic {
    Tour: typeof TourClass;
  }

  const Shepherd: ShepherdStatic;
  export default Shepherd;
}
