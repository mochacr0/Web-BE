const checkParam = (param) => {
  if (param == null || param == undefined || param.length == 0) {
    return false;
  }
  return true;
};

const checkParams = (params) => {
  let error = "";
  const paramNames = Object.keys(params);
  for (let i = 0; i < paramNames.length; i++) {
    let name = paramNames[i];
    let param = params[name];
    if (!checkParam(param)) {
      error = `Parameter '${name}' must be specific`;
      break;
    }
  }
  return error;
};

export { checkParam, checkParams };
