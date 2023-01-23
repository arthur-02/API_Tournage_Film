import { useState } from 'react';

import L from 'leaflet';
import 'leaflet.awesome-markers';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import Info from './components/Info'
//import leaflet components
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
//import leaflet css
import 'leaflet/dist/leaflet.css'
import './App.css'

const redMarker = new L.AwesomeMarkers.icon({
  icon: 'star',
  prefix: 'fa',
  markerColor: 'red'
});

const blueMarker = new L.AwesomeMarkers.icon({
  icon: 'star',
  prefix: 'fa',
  markerColor: 'blue'
});
function App() {
  const [films, setFilms] = useState(null);
  const [query, setQuery] = useState({ titre: '', date: '', realisateur: '', arrondissement: '750' });
  const [map, setMap] = useState(null);

  async function getFilmsLocations() {
    let arr = query.arrondissement;
    if (arr.length < 4) arr = undefined;
    else if (arr && arr.length < 5) {
      arr = '7500' + arr[3];
      setQuery({ ...query, arrondissement: arr });
    }
    const parameters_name = ["nom_tournage", "annee_tournage", "nom_realisateur", "ardt_lieu"];
    const parameters_value = [query.titre, query.date, query.realisateur, arr];
    const fullParameters = parameters_name.map((name, index) => {
      if (parameters_value[index])
        return `${name}=${parameters_value[index]}`;
    }).filter(item => item).join(' AND ');
    const url = `https://opendata.paris.fr/api/records/1.0/search/?dataset=lieux-de-tournage-a-paris&q=(${fullParameters})&lang=fr&facet=annee_tournage&facet=type_tournage&facet=nom_tournage&facet=nom_realisateur&facet=nom_producteur&facet=ardt_lieu&facet=date_debut&facet=date_fin`
    console.log(url);
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  function showMarker(film) {
    const newFilms = films.map(f => {
      if (f === film) {
        f.show = true;
      }
      else {
        f.show = false;
      }
      return f;
    });
    setFilms(newFilms);
    map.flyTo(film.geo_point_2d, 15);
    //Scroll up to the map
    //Make it smooth
    window.scrollTo({
      top: 650,
      behavior: 'smooth'
    });


  }
  function handleSubmit(e) {
    e.preventDefault();
    getFilmsLocations().then(data => {
      const filmsData = data.records.map(film => film.fields);
      setFilms(filmsData);
    });
    window.scrollTo({
      top: 650,
      behavior: 'smooth'
    });
  }
  function handleArr(e) {
    let str = e.target.value;
    if (str.indexOf('750') != 0)
      str = '750';

    setQuery({ ...query, arrondissement: str });
  }

  return (
    <>
      <div className="App">
        <header className="App-header">
          <h1>Localisation des tournages</h1>
        </header>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nom du film" value={query.titre} onChange={(e) => setQuery({ ...query, titre: e.target.value })} />
          <input type="text" placeholder="Date" value={query.date} onChange={(e) => setQuery({ ...query, date: e.target.value })} />
          <input type="text" placeholder="Nom du réalisateur" value={query.realisateur} onChange={(e) => setQuery({ ...query, realisateur: e.target.value })} />
          <input type="text" placeholder="Arrondissement" value={query.arrondissement} onChange={handleArr} />
          <button type="submit">Search</button>
        </form>
        {films?.length == 0 && <p>Aucun film trouvé</p>}
        <MapContainer center={[48.86, 2.345]} zoom={11.5} scrollWheelZoom={true} ref={setMap}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {films?.map((film, index) => (
            <Marker eventHandlers={{ click: (_) => showMarker(film) }} icon={film.show ? redMarker : blueMarker} key={index} position={film.geo_point_2d}>
              <Popup>{film.nom_tournage}</Popup>
            </Marker>
          ))}
        </MapContainer>
        {films?.map((film, index) => (
          <div onClick={(_) => showMarker(film)} key={index} className={`filmsInfos ${film.show ? 'selected' : ''}`}>
            <h2>{film.nom_tournage}</h2>
            <Info title="Adresse" description={film.adresse_lieu} />
            <Info title="Arrondissement" description={film.ardt_lieu} />
            <Info title="Annee de tournage" description={film.annee_tournage} />
            <Info title="Type de tournage" description={film.type_tournage} />
          </div>
        ))}
      </div>
      <p>Copyright © 2023 - <a href="https://www.linkedin.com/in/arthur-liot/">Arthur Liot</a></p>
    </>
  )
}

export default App
