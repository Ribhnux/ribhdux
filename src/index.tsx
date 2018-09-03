import * as React from "react";
import { createStore, Store, applyMiddleware, Middleware } from "redux";
import { createSelector, OutputSelector } from "reselect";
// import { getFunctionHash } from "./util";
// import { Provider } from "react-redux";

interface Action {
  type: string;
  payload?: any;
}

enum RibhduxStateMachine {
  IDLE,
  PROCESSING
}

class Ribhdux<T> {
  // private feature: any;
  // private actions: Action[] = [];
  // private actionHash: any = {};
  private temp: any = {};
  private middleware: Middleware<any, any, any>[] = [];
  private store: Store;
  private currentAction: string = "";
  private internalState: RibhduxStateMachine = RibhduxStateMachine.IDLE;
  private ribhduxKeys: string[] = [];
  private selectors: any = {};
  private initialState: T;
  private prevState: T = {} as T;
  private nextState: T = {} as T;

  protected payloadDraft: any = {};
  constructor(initialState: any) {
    this.initialState = initialState;
    this.ribhduxKeys = Object.keys(this);
    this.temp = initialState;
  }

  private recordMiddleware(store) {
    this.prevState = store.getState();
    return next => action => next(action);
  }

  get state(): T {
    if (this.store) return this.store.getState();
    return {} as T;
  }

  public startDispatch(name: string) {
    this.internalState = RibhduxStateMachine.PROCESSING;
    this.currentAction = name;
  }

  public commitDispatch() {
    const anyPayloadDraft = Object.keys(this.payloadDraft).length > 0;
    const isCurrentActionNotEmpty = this.currentAction !== "";
    const capableToDispatch = isCurrentActionNotEmpty && anyPayloadDraft;

    if (capableToDispatch) this.doDispatch();
  }

  private doDispatch() {
    if (this.store) {
      const action = this.createActionFromCurrent();

      this.store.dispatch(action);
      this.resetActionAndPayload();
      this.internalState = RibhduxStateMachine.IDLE;
    }
  }

  private createActionFromCurrent() {
    const type = this.currentAction;
    return { type, ...this.payloadDraft };
  }

  private resetActionAndPayload() {
    this.payloadDraft = {};
    this.currentAction = "";
  }

  private filterByRibhduxKeys(keyName: string) {
    return !this.ribhduxKeys.includes(keyName);
  }

  private resetPayloadDraft() {
    if (Object.keys(this.payloadDraft).length <= 0) {
      this.payloadDraft = {};
    }
  }

  private redefineProperty(keyName: string) {
    const getter = keyName => () => {
      const isProcessing =
        this.internalState === RibhduxStateMachine.PROCESSING;

      return isProcessing ? this.temp[keyName] : this.state[keyName];
    };

    const setter = keyName => val => {
      this.resetPayloadDraft();
      this.temp[keyName] = val;
      this.payloadDraft[keyName] = val;
    };

    const definePropertyProps = {
      get: getter(keyName),
      set: setter(keyName)
    };

    Object.defineProperty(this, keyName, definePropertyProps);
  }

  private initializeStore() {
    this.use(this.recordMiddleware.bind(this));
    this.store = createStore(
      this.reducer,
      this.initialState,
      applyMiddleware(...this.middleware)
    );
  }

  protected createActionsFrom(store: any) {
    Object.keys(store)
      .filter(this.filterByRibhduxKeys.bind(this))
      .forEach(this.redefineProperty.bind(this));

    this.initializeStore();
  }

  private reducer(state: any, action: any): any {
    if (typeof state === "undefined") {
      return this.initialState;
    }

    delete action.type;
    return { ...state, ...action };
  }

  // Reselect Extension
  protected createSelectorFromMethod(
    selectorName: string,
    justSelector: boolean,
    resultFn: any[],
    ...inputSelectorsName: string[]
  ): any {
    const prototypes = Object.getPrototypeOf(this);
    const keysOfPrototypes = Object.keys(prototypes);

    const validPropertiesOrMethod = inputSelectorsName
      .filter(name => {
        const isInState = typeof this.state[name] !== "undefined";
        const isInPrototypes = keysOfPrototypes.includes(name);
        const isNotConstructor = name !== "constructor";

        const filterCriteria =
          (isInState || isInPrototypes) && isNotConstructor;
        return filterCriteria;
      })
      .map(name => {
        const isInState = typeof this.state[name] !== "undefined";
        const isInPrototypes = keysOfPrototypes.includes(name);

        let type: string | null = null;
        type = isInState ? "state" : "method";
        type = isInPrototypes ? "method" : type;

        return { type, name };
      });

    const createInputSelectors = validPropertiesOrMethod.map(candidate => {
      if (candidate.type === "method") {
        this["callFrom"] = "createSelectorFromMethod";
        return this[candidate.name].apply(this);
      }
      return state => state[candidate.name];
    });

    const createSelectorArgs = [...createInputSelectors, resultFn];
    const realSelector = this.selectors[selectorName]
      ? this.selectors[selectorName]
      : createSelector.apply(this, createSelectorArgs);

    // console.log(justSelector, createInputSelectors);

    if (justSelector) return realSelector;
    return realSelector(this.state);
  }

  // protected applySelector(selector) {

  // }

  // redux extensions goes here
  use(...middleware: Middleware<any, any, any>[]) {
    this.middleware.push(...middleware);
  }

  // Time travelling features goes here
  undo() {
    console.log(this.prevState);
  }
  redo() {}

  // React things goes here
  static Manage(app: React.Component) {
    // return <Provider store={store}>{app}</Provider>;
  }
}

export default Ribhdux;
export * from "./decorators";
