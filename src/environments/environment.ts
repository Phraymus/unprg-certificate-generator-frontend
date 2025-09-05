import {environmentBase, mergeEnviroments} from "./environment.base";

export const environment = {
  production: false,
  ...mergeEnviroments(environmentBase, {

  }),
};
