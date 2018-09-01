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

export function selector(
  target: any,
  key: string,
  descriptor: TypedPropertyDescriptor<Ribhdux>
) {
  return descriptor;
}

export function actionDispatcher(
  target: any,
  key: string,
  descriptor: PropertyDescriptor | undefined
) {
  if (descriptor !== undefined) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args: any[]) {
      try {
        const targetName = target.constructor.name;
        const actionName = createActionCreatorName(targetName, key);

        target.startDispatch.call(this, actionName);
        originalMethod.apply(this, args);
        target.commitDispatch.call(this);
      } catch (e) {
        console.error(e);
      }
    };

    return descriptor;
  }
}

export function asyncActionDispatcher(
  target: any,
  key: string,
  descriptor: PropertyDescriptor | undefined
) {
  if (descriptor !== undefined) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const targetName = target.constructor.name;
      const actionName = createActionCreatorName(targetName, key);

      target.startDispatch.call(this, actionName);
      await originalMethod.apply(this, args);
      target.commitDispatch.call(this);
    };

    return descriptor;
  }
}
