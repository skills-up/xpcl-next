import { useEffect, useState } from 'react';
import { getList } from '../../api/xplorzApi';
import { sendToast } from '../../utils/toastify';
import Switch from 'react-switch';

const PermissionSwitch = ({
  errorRedirect,
  setSelectedPermissions,
  presentRoles = undefined,
  readOnly = false,
}) => {
  const standard = {};
  const additional = [];
  let selectstandard = {};
  const [_standard, _setStandard] = useState({});
  const [_additional, _setAdditional] = useState([]);
  const capsWords = ['PDF', 'PNR', 'GST', 'MIS'];

  useEffect(() => {
    getPermissions();
  }, []);

  // Setting selected permissions array on each change
  useEffect(() => {
    let _selectedPermissions = [];
    Object.keys(_standard).map((key) => {
      const perms = _standard[key];
      perms.map((perm) => {
        perm && perm.selected && _selectedPermissions.push(perm.id);
      });
    });
    _additional.map((add) => {
      add.selected && _selectedPermissions.push(add.id);
    });
    setSelectedPermissions(_selectedPermissions);
  }, [_standard, _additional]);

  const titelize = (slug) =>
    slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.substring(1))
      .join(' ');

  const renderSwitch = (perm, key = null, index = 0) => {
    let permissions = { ..._standard };
    return (
      <Switch
        onChange={(checked) => {
          if (!readOnly) {
            permissions[key][index].selected = checked;
            _setStandard({ ...permissions });
          }
        }}
        checked={perm.selected}
        handleDiameter={24}
        boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
        height={20}
        width={48}
        className='react-switch'
      />
    );
  };

  const renderSwitchAdd = (perm, i) => {
    let permissions = [..._additional];
    return (
      <Switch
        onChange={(checked) => {
          if (!readOnly) {
            permissions[i].selected = checked;
            _setAdditional([...permissions]);
          }
        }}
        checked={perm.selected}
        handleDiameter={24}
        boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
        height={20}
        width={48}
        className='react-switch'
      />
    );
  };

  const fetch = async (st, ad) => {
    Object.keys(st).map((key) => {
      const perms = st[key];
      perms
        .filter((p) => p != null)
        .map((perm) => {
          var selectedPermission = presentRoles.find(
            (permission) => permission === perm.name
          );

          if (selectedPermission) {
            perm.selected = true;
          }
        });
    });
    ad.map((add) => {
      var selectedPermission = presentRoles.find((permission) => permission === add.name);
      if (selectedPermission) {
        add.selected = true;
      }
    });
    _setStandard({ ...st });
    _setAdditional([...ad]);
  };

  const getPermissions = async () => {
    const response = await getList('permissions');
    if (response?.success) {
      let permissions = response.data;
      permissions.forEach((_permission) => {
        const element = _permission.slug;
        const parts = element.split('.');
        const entity = parts[0];
        const permission = parts.slice(1).join('.');
        const idx = ['index', 'show', 'store', 'update', 'destroy'].indexOf(permission);
        if (idx >= 0) {
          if (!standard[entity]) {
            standard[entity] = [null, null, null, null, null];
            selectstandard[entity] = [null, null, null, null, null];
          }
          standard[entity][idx] = permission;
          selectstandard[entity][idx] = {
            permission: permission,
            selected: false,
            id: _permission.id,
            name: _permission.slug,
          };
        } else {
          additional.push({
            parts: parts,
            selected: false,
            id: _permission.id,
            name: _permission.slug,
            desc: _permission.description,
          });
        }
        _setStandard({ ...selectstandard });
        _setAdditional([...additional]);
        if (presentRoles) {
          fetch({ ...selectstandard }, [...additional]);
        }
      });
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Error getting permissions',
        4000
      );
      window.location.assign(errorRedirect);
    }
  };

  return (
    <div className='overflow-scroll scroll-bar-1'>
      <h6 className='my-3 d-inline-block'>Standard Permissions</h6>
      <table className='table-6' style={{ marginBottom: '25px' }}>
        <thead>
          <tr>
            <th></th>
            <th>List</th>
            <th>Show</th>
            <th>Create</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(_standard).map((key) => {
            const perms = _standard[key];
            let finalEntity = titelize(key);
            let eStr = '';
            for (let e of finalEntity.split(' ')) {
              if (capsWords.includes(e?.toUpperCase())) eStr += e.toUpperCase() + ' ';
              else eStr += e + ' ';
            }
            return (
              <tr key={key}>
                <td>{eStr}</td>
                <td>{perms[0] ? renderSwitch(perms[0], key, 0) : ''}</td>
                <td>{perms[1] ? renderSwitch(perms[1], key, 1) : ''}</td>
                <td>{perms[2] ? renderSwitch(perms[2], key, 2) : ''}</td>
                <td>{perms[3] ? renderSwitch(perms[3], key, 3) : ''}</td>
                <td>{perms[4] ? renderSwitch(perms[4], key, 4) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h6 className='d-inline-block mx-3'>Additional Permissions</h6>
      <table className='table-6'>
        <tbody>
          {_additional.map((perm, i) => {
            let [entity, ...permission] = perm.parts;
            console.log('Test', entity, permission);
            let finalEntity = titelize(entity);
            let finalPerm = titelize(permission.reverse().join('-'));
            let eStr = '';
            let pStr = '';
            for (let e of finalEntity.split(' ')) {
              if (capsWords.includes(e?.toUpperCase())) eStr += e.toUpperCase() + ' ';
              else eStr += e + ' ';
            }
            for (let e of finalPerm.split(' ')) {
              if (capsWords.includes(e?.toUpperCase())) pStr += e.toUpperCase() + ' ';
              else pStr += e + ' ';
            }
            return (
              <tr key={perm.parts.join('.')}>
                <td>
                  <span className='d-block'>{eStr + '- ' + pStr}</span>
                  <span className='d-block text-secondary'>{perm.desc}</span>
                </td>
                <td>{renderSwitchAdd(perm, i)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionSwitch;
