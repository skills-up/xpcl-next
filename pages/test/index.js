import {
  createItem,
  deleteItem,
  getItem,
  getList,
  updateItem,
} from '../../api/xplorzApi';

export default function Test() {
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
  return (
    <div>
      <button onClick={test}>Test</button>
    </div>
  );
}
