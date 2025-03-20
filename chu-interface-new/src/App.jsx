import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({
    id: "",
    esi: 1,
    pathologie: "infarctus",
    needs: { lit_rea: 0, respirateur: 0, scanner: 0, lit: 0 },
    wait_window: 25,
    day: 0,
  });
  const [results, setResults] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let numericValue = parseInt(value);

    // Empêcher les valeurs négatives
    if (!isNaN(numericValue) && numericValue < 0) {
      numericValue = 0;
    }

    if (name.startsWith("needs.")) {
      const needKey = name.split(".")[1];
      setNewPatient({
        ...newPatient,
        needs: { ...newPatient.needs, [needKey]: numericValue || 0 },
      });
    } else {
      setNewPatient({
        ...newPatient,
        [name]: ["esi", "wait_window", "day"].includes(name) ? numericValue : value,
      });
    }
  };

  const addPatient = () => {
    if (!newPatient.id.trim()) return; // Vérification que l'ID est rempli
    setPatients([...patients, newPatient]);
    setNewPatient({
      id: "",
      esi: 1,
      pathologie: "infarctus",
      needs: { lit_rea: 0, respirateur: 0, scanner: 0, lit: 0 },
      wait_window: 25,
      day: newPatient.day,
    });
  };

  const predictAssignment = async () => {
    const data = { patients, day: patients[0]?.day || 0 };
    try {
      const response = await axios.post(
        "http://localhost:5000/assign-patients",
        data
      );
      setResults(response.data.results || []);
    } catch (error) {
      console.error("Erreur lors de la prédiction :", error);
    }
  };

  return (
    <div className="App">
      <h1> Affectation des Patients</h1>

      <div className="form-container">
        <h2> Ajouter un patient</h2>
        
        <label htmlFor="id">🔹 Identifiant Patient :</label>
        <input
          id="id"
          type="text"
          name="id"
          value={newPatient.id}
          onChange={handleInputChange}
          placeholder="Ex: PAT123"
          required
        />

        <label htmlFor="esi">🔹 Échelle de gravité (ESI) :</label>
        <select id="esi" name="esi" value={newPatient.esi} onChange={handleInputChange}>
          {[1, 2, 3, 4, 5].map((esi) => (
            <option key={esi} value={esi}>
              {esi}
            </option>
          ))}
        </select>

        <label htmlFor="pathologie">🔹 Pathologie :</label>
        <select id="pathologie" name="pathologie" value={newPatient.pathologie} onChange={handleInputChange}>
          {["infarctus", "pneumonie", "fracture", "infection", "inconnue"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <fieldset className="needs-section">
          <legend>🔹 Besoins en soins :</legend>

          <label htmlFor="lit_rea">Lit Réanimation :</label>
          <input
            id="lit_rea"
            type="number"
            name="needs.lit_rea"
            value={newPatient.needs.lit_rea}
            onChange={handleInputChange}
            placeholder="Ex: 1"
          />

          <label htmlFor="respirateur">Respirateur :</label>
          <input
            id="respirateur"
            type="number"
            name="needs.respirateur"
            value={newPatient.needs.respirateur}
            onChange={handleInputChange}
            placeholder="Ex: 1"
          />

          <label htmlFor="scanner">Scanner :</label>
          <input
            id="scanner"
            type="number"
            name="needs.scanner"
            value={newPatient.needs.scanner}
            onChange={handleInputChange}
            placeholder="Ex: 1"
          />

          <label htmlFor="lit">Lit d'hôpital :</label>
          <input
            id="lit"
            type="number"
            name="needs.lit"
            value={newPatient.needs.lit}
            onChange={handleInputChange}
            placeholder="Ex: 1"
          />
        </fieldset>

        <label htmlFor="wait_window">🔹 Temps d'attente (minutes) :</label>
        <input
          id="wait_window"
          type="number"
          name="wait_window"
          value={newPatient.wait_window}
          onChange={handleInputChange}
          placeholder="Ex: 25"
        />

        <label htmlFor="day">🔹 Jour d'arrivée :</label>
        <input
          id="day"
          type="number"
          name="day"
          value={newPatient.day}
          onChange={handleInputChange}
          placeholder="Jour"
        />

        <button 
          className="add-btn" 
          onClick={addPatient} 
          disabled={!newPatient.id.trim()} // Désactiver le bouton si l'ID est vide
        >
          ➕ Ajouter Patient
        </button>
      </div>

      <button className="predict-btn" onClick={predictAssignment} disabled={!patients.length}>
        🔍 Prédire Affectation
      </button>

      {results.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID Patient</th>
              <th>Jour</th>
              <th>ESI</th>
              <th>Pathologie</th>
              <th>CHU Initial</th>
              <th>CHU Transféré</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.id}</td>
                <td>{result.jour}</td>
                <td>{result.esi}</td>
                <td>{result.pathologie}</td>
                <td>{result.chu_initial}</td>
                <td>{result.chu_transfere}</td>
                <td>{result.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-results">Aucun résultat à afficher</p>
      )}
    </div>
  );
}

export default App;
