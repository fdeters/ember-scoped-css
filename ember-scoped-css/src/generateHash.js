import md5 from 'blueimp-md5';

export default function (relativePath) {
  return 'e' + md5(relativePath).substring(0, 8);
}
