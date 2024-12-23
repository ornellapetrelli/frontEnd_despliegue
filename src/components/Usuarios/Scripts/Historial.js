import React, { useEffect, useState } from 'react';
import '../Styles/Historial.css';

const Historial = () => {
  const [userFlights, setUserFlights] = useState([]);

  const fetchFlights = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      //const token = localStorage.getItem('token');
      if (!authToken) {
        console.error('Token no encontrado. Usuario no autenticado.');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/history/historial`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener el historial de vuelos');
      }

      const vuelos = await response.json();
      setUserFlights(vuelos);
    } catch (error) {
      console.error('Error al obtener el historial de vuelos:', error);
    }
  };
  const cancelarVuelo = async (idVuelo) => {

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('Token no encontrado. Usuario no autenticado.');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/history/eliminar/${idVuelo}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cancelar el vuelo');
      }

      setUserFlights((prevFlights) =>
        prevFlights.filter((flight) => flight._id !== idVuelo)
      );
    } catch (error) {
      console.error('Error al cancelar el vuelo:', error);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  return (
    <div className="historial-page">
      <h1>Historial de Viajes</h1>
      {userFlights.length === 0 ? (
        <div className="no-flights-message">
          <p>En esta sección podrás tener un registro de aquellos viajes que fuiste teniendo.</p>
          <p>No tienes viajes registrados.</p>
        </div>
      ) : (
        <ul className="flights-list">
          {userFlights.map((flight, index) => (
            <li key={index} className="flight-item">
              <div className={`ticket ${flight.estadoVuelo === 'Cancelado' ? 'cancelled' : ''}`}>
                <div className="ticket-header">
                  <p><strong>Partida:</strong> {flight.lugarPartida}</p>
                  <p><strong>Destino:</strong> {flight.lugarDestino}</p>
                  <p><strong>Fecha:</strong> {new Date(flight.fechaVuelo).toLocaleDateString()}</p>
                </div>
                <div className="ticket-body">
                  <p><strong>Precio:</strong> ${flight.precio}</p>
                  <p><strong>Aerolínea:</strong> {flight.aerolinea}</p>
                </div>
                <div className="ticket-footer">
                  {console.log(flight.estadoVuelo)}
                  {flight.estadoVuelo !== 'Cancelado' && (
                    <button
                      className="btn-cancel"
                      onClick={() => cancelarVuelo(flight._id)}
                    >
                      Cancelar Vuelo
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}

        </ul>
      )}
    </div>
  );

};

export default Historial;
