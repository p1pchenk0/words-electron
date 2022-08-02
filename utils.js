module.exports = {
  promisify(fn, ...options) {
    return new Promise((resolve) => {
      const fnArguments = [(...args) => resolve(args)];

      if (options) fnArguments.unshift(...options);

      fn(...fnArguments);
    });
  },

  getRandomString(length) {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    return possible.split('').sort(() => Math.random() - 0.5).slice(0, length).join('');
  }
}
