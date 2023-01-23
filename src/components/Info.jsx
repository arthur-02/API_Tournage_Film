import './Info.css';
function Info({ title, description }) {
  return (
    <div className='Info'>
      <h3 className='title' >{title}</h3>
      <p className='description'>{description}</p>
    </div>
  );
}

export default Info;
