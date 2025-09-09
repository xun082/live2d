import { useCallback } from "react";
import { useLive2dApi } from "./useLive2dApi";

// Example: How to use Live2D motion control in your components

export const useLive2DMotions = () => {
  const { live2d } = useLive2dApi();

  // Play random motion from a group
  const playRandomMotion = useCallback(
    async (group: string) => {
      if (!live2d) return false;
      try {
        return await live2d.playMotion(group);
      } catch (error) {
        console.error("Error playing motion:", error);
        return false;
      }
    },
    [live2d]
  );

  // Play specific motion
  const playSpecificMotion = useCallback(
    async (group: string, index: number) => {
      if (!live2d) return false;
      try {
        return await live2d.playMotion(group, index);
      } catch (error) {
        console.error("Error playing motion:", error);
        return false;
      }
    },
    [live2d]
  );

  // Play expression
  const playExpression = useCallback(
    async (expressionId: string) => {
      if (!live2d) return;
      try {
        await live2d.expression(expressionId);
      } catch (error) {
        console.error("Error playing expression:", error);
      }
    },
    [live2d]
  );

  // Set parameter value
  const setParameter = useCallback(
    (paramId: string, value: number) => {
      if (!live2d) return;
      try {
        live2d.setParam(paramId, value);
      } catch (error) {
        console.error("Error setting parameter:", error);
      }
    },
    [live2d]
  );

  // Get available motions
  const getAvailableMotions = useCallback(() => {
    if (!live2d) return { groups: [], expressions: [] };
    try {
      return {
        groups: live2d.getMotionGroupNames(),
        expressions: live2d.getExpressions(),
      };
    } catch (error) {
      console.error("Error getting motion data:", error);
      return { groups: [], expressions: [] };
    }
  }, [live2d]);

  return {
    playRandomMotion,
    playSpecificMotion,
    playExpression,
    setParameter,
    getAvailableMotions,
  };
};

// Example usage in a component:
/*
const MyComponent = () => {
  const { playRandomMotion, playExpression } = useLive2DMotions();
  
  const handleClick = () => {
    // Play tap motion when clicked
    playRandomMotion('Tap');
  };
  
  const handleHover = () => {
    // Show happy expression on hover
    playExpression('happy');  // depends on your model's expressions
  };
  
  return (
    <button onClick={handleClick} onMouseEnter={handleHover}>
      Click me!
    </button>
  );
};
*/
