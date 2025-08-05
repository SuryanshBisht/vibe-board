import './EditShortcutsMenu.css';
import { useEffect, useRef, useState } from 'react';
import { default_custom_shortcuts } from '../data/data';


const EditShortcutsMenu = ({shortcuts, setShortcuts, setEditShortCutsMenu }) => {
    const allKeys = [
        'a','b','c','d','e','f','g','h','i','j','k','l','m',
        'n','o','p','q','r','s','t','u','v','w','x','y','z',
        '0','1','2','3','4','5','6','7','8','9',
    ];
    // const [availableKeys, setAvailableKeys] = useState(allKeys.filter(key => !Object.values(shortcuts).includes(key)));
    // const formData=useRe(shortcuts
    const [formData, setFormData] = useState(shortcuts);
    const availKeysRef = useRef(allKeys.filter(key => !Object.values(shortcuts).includes(key)));
    
    const handleChange = (shape, newKey) => {
        let newFormData = { ...formData };
        console.log('Changing shortcut for shape:', shape, 'to new key:', newKey);
        console.log('Current formData before change:', newFormData);
        newFormData[shape] = newKey;
        console.log('Updated formData:', newFormData);
        setFormData(newFormData);
    };

    const handleSubmit = () => {
        setShortcuts(formData);
        localStorage.setItem("myShortcuts", JSON.stringify(formData));
        setEditShortCutsMenu(false);
        console.log('New Shortcuts:', formData);
    };

    const handleReset = () => {
        setFormData(default_custom_shortcuts);
        setShortcuts(default_custom_shortcuts);
        localStorage.removeItem("myShortcuts");
        // setEditShortCutsMenu(false);
        console.log('Shortcuts reset to default:', shortcuts);
    };

    useEffect(() => {
        availKeysRef.current = allKeys.filter(key => !Object.values(formData).includes(key));
        console.log('Available keys updated:', availKeysRef.current);
        console.log('Form data updated:', formData);
    }, [formData]);

    return (
        <>
        <div className="overlay" />
          <div className="popup">
            <div className="popup-header">
              <h2 style={{color: 'black'}}>Edit Shortcuts</h2>
              <button className="close-btn" onClick={() => setEditShortCutsMenu(false)}>×</button>
            </div>
            <div className="popup-body">
              {Object.entries(formData).map(([shape, key]) => (
                <div key={shape} className="form-row">
                  <label style={{color: 'black'}}>{shape}</label>
                  <select
                    value={key}
                    onChange={(e) => handleChange(shape, e.target.value)}
                  >
                    
                    <option key={key} value={key}>{key}</option>
                    {
                    (availKeysRef.current).map((availableKey) => (
                      <option key={availableKey} value={availableKey}>{availableKey}</option>
                    ))
                    }
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
            <div className="popup-footer">
                <button onClick={handleReset}>Reset Shortcuts</button>
            </div>
            <div className="popup-footer">
                <button onClick={handleSubmit}>Save</button>
            </div>
            </div>
          </div>
        </>
    )
};

export default EditShortcutsMenu;