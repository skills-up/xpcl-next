import { useState, useEffect } from 'react';
import {
  createItem,
  deleteItem,
  getItem,
  getList,
  updateItem,
} from '../../api/xplorzApi';
import Datatable from '../../components/datatable/Datatable';

export default function Test() {
  const [arr, setArr] = useState([]);

  useEffect(() => {
    let tempArr = [];
    for (let i = 0; i < 200; i++) {
      tempArr.push({ id: i, desc: 'I am ' + i, timestamp: Date.now() });
    }
    setArr(tempArr);
  }, []);

  const test = async () => {
    // Get List
    let response = await getList('roles', { paginate: 20, test: 1 });
    console.log('getList', response);
    // // Create List
    // response = await createItem('roles', { name: 'test1', description: 'test123' });
    // console.log('createList', response);
    // // Get Item
    // response = await getItem('roles', 1);
    // console.log('getItem', response);
    // // Update Item
    // response = await updateItem('roles', 2, {
    //   name: 'test1',
    //   description: 'test123',
    //   permission_ids: [0],
    // });
    // console.log('updateItem', response);
    // // Delete item
    // response = await deleteItem('roles', 2);
    // console.log('deleteItem', response);
  };

  const columns = [
    {
      Header: 'ID',
      accessor: 'id',
    },
    {
      Header: 'Description',
      accessor: 'desc',
    },
    {
      Header: 'Timestamp',
      accessor: 'timestamp',
    },
    {
      Header: 'Actions',
      sortable: false,
      // cell: () => <Button variant="danger" data-tag="allowRowEvents" data-action="delete"><FontAwesomeIcon icon={faTrash} /></Button>,
      Cell: (data) => {
        return <div className='flex flex-start'></div>;
      },
    },
  ];

  return (
    <div>
      <button onClick={test}>Test</button>
      <div className='mx-5'>
        <Datatable columns={columns} data={arr} />
      </div>
    </div>
  );
}
