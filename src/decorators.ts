import Ribhdux from ".";
function createActionCreatorName(
  targetName: string,
  methodName: string
): string {
  const properName = `${targetName}/${methodName}`
    .replace(/\.?([A-Z])/g, (x, y) => "_" + y.toLowerCase())
    .replace(/^_/, "")
    .toUpperCase();
  return `@${properName}`;
}

function $args(func) {
  return (func + "")
    .replace(/[/][/].*$/gm, "") // strip single-line comments
    .replace(/\s+/g, "") // strip white space
    .replace(/[/][*][^/*]*[*][/]/g, "") // strip multi-line comments
    .split("){", 1)[0]
    .replace(/^[^(]*[(]/, "") // extract the parameters
    .replace(/=[^,]+/g, "") // strip any ES6 defaults
    .split(",")
    .filter(Boolean); // split & filter [""]
}

export function inputSelector(
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  console.log("inputSelector", propertyKey, parameterIndex);
}

export function selector(
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) {
  if (descriptor !== undefined) {
    const originalMethod = descriptor.value;
    const targetName = target.constructor.name;

    descriptor.value = function(...args: any[]) {
      try {
        const nameArgs = $args(originalMethod);
        const callFromOtherSelector =
          this["callFrom"] === "createSelectorFromMethod";
        const createSelectorFromMethodArgs: any[] = [
          key,
          callFromOtherSelector,
          originalMethod,
          ...nameArgs
        ];

        const selector = target.createSelectorFromMethod.apply(
          this,
          createSelectorFromMethodArgs
        );

        if (callFromOtherSelector) {
          delete this["callFrom"];
        }

        return selector;
      } catch (e) {
        console.error(e);
      }
    };
    return descriptor;
  }
}

interface IActionDispatcherParams {
  descriptor: PropertyDescriptor;
  target: any;
  originalMethod: any;
  actionName: string;
}

function syncActionDispatcherDescriptor({
  descriptor,
  target,
  originalMethod,
  actionName
}: IActionDispatcherParams) {
  descriptor.value = function(...args: any[]) {
    try {
      target.startDispatch.call(this, actionName);
      originalMethod.apply(this, args);
      target.commitDispatch.call(this);
    } catch (e) {
      console.error(e);
    }
  };
  return descriptor;
}

function asyncActionDispatcherDescriptor({
  descriptor,
  target,
  originalMethod,
  actionName
}: IActionDispatcherParams) {
  descriptor.value = async function(...args: any[]) {
    try {
      target.startDispatch.call(this, actionName);
      await originalMethod.apply(this, args);
      target.commitDispatch.call(this);
    } catch (e) {
      console.error(e);
    }
  };
  return descriptor;
}

export function actionDispatcher(isAsync = false) {
  return function(
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor
  ) {
    if (descriptor !== undefined) {
      const originalMethod = descriptor.value;
      const targetName = target.constructor.name;
      const actionName = createActionCreatorName(targetName, methodName);
      const actionDispatcherDescriptorParams = {
        descriptor,
        target,
        originalMethod,
        actionName
      };

      const newDescriptor = isAsync
        ? asyncActionDispatcherDescriptor(actionDispatcherDescriptorParams)
        : syncActionDispatcherDescriptor(actionDispatcherDescriptorParams);

      return newDescriptor;
    }
  };
}
