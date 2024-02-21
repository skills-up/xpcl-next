import { useSelector } from 'react-redux';

const permissions = useSelector((state) => state.auth.value.permissions);

export const hasPermission = (permission) => permissions.includes(permission);

export const filterAllowed = (arr) =>
  arr.filter((item) =>
    item.permissions?.length
      ? item.permissions.some((p) => hasPermission(p))
      : item.links
      ? item.links.length > 0
      : item.submenus
      ? item.submenus.length > 0
      : true
  );
