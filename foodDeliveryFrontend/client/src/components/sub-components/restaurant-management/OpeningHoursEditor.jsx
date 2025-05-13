import React from 'react';
import { Button, Card, Label, Select, TextInput, ToggleSwitch } from 'flowbite-react';
import { HiOutlineClock, HiPlus, HiTrash } from 'react-icons/hi';

const daysOfWeek = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const initialHours = {
  dayOfWeek: 1,
  openTime: '09:00',
  closeTime: '17:00',
  closed: false
};

export default function OpeningHoursEditor({ openingHours, setOpeningHours }) {
  const addHours = () => {
    // Find the next day that doesn't have hours set
    const existingDays = openingHours.map(h => h.dayOfWeek);
    const availableDays = daysOfWeek.filter(day => !existingDays.includes(day.value));
    
    if (availableDays.length > 0) {
      const newDay = {...initialHours, dayOfWeek: availableDays[0].value};
      setOpeningHours([...openingHours, newDay]);
    } else {
      // All days already have hours set
      alert('Hours for all days of the week have been added.');
    }
  };

  const removeHours = (index) => {
    const updatedHours = [...openingHours];
    updatedHours.splice(index, 1);
    setOpeningHours(updatedHours);
  };

  const updateHours = (index, field, value) => {
    const updatedHours = [...openingHours];
    updatedHours[index][field] = value;
    setOpeningHours(updatedHours);
  };

  const toggleClosed = (index) => {
    const updatedHours = [...openingHours];
    updatedHours[index].closed = !updatedHours[index].closed;
    setOpeningHours(updatedHours);
  };

  // Sort hours by day of week
  const sortedHours = [...openingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Restaurant Opening Hours</h3>
        <Button 
          size="sm" 
          gradientDuoTone="cyanToBlue"
          onClick={addHours}
        >
          <HiPlus className="mr-2" />
          Add Hours
        </Button>
      </div>

      {sortedHours.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <HiOutlineClock className="mx-auto text-gray-400 text-4xl mb-2" />
          <p className="text-gray-500">No opening hours defined</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Hours" to set your restaurant's operating hours</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedHours.map((hours, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-full md:w-1/4">
                  <Label htmlFor={`day-${index}`} value="Day" />
                  <Select
                    id={`day-${index}`}
                    value={hours.dayOfWeek}
                    onChange={(e) => updateHours(index, 'dayOfWeek', parseInt(e.target.value))}
                    disabled={sortedHours.length === 7} // Disable if all days are added
                  >
                    {daysOfWeek.map(day => (
                      <option 
                        key={day.value} 
                        value={day.value}
                        disabled={openingHours.some(h => h !== hours && h.dayOfWeek === day.value)}
                      >
                        {day.label}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!hours.closed && (
                    <>
                      <div>
                        <Label htmlFor={`open-${index}`} value="Open Time" />
                        <TextInput
                          id={`open-${index}`}
                          type="time"
                          value={hours.openTime}
                          onChange={(e) => updateHours(index, 'openTime', e.target.value)}
                          disabled={hours.closed}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`close-${index}`} value="Close Time" />
                        <TextInput
                          id={`close-${index}`}
                          type="time"
                          value={hours.closeTime}
                          onChange={(e) => updateHours(index, 'closeTime', e.target.value)}
                          disabled={hours.closed}
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Label className="mr-2" htmlFor={`closed-${index}`}>
                      {hours.closed ? 'Closed' : 'Open'}
                    </Label>
                    <ToggleSwitch
                      id={`closed-${index}`}
                      checked={!hours.closed}
                      onChange={() => toggleClosed(index)}
                    />
                  </div>
                  <Button 
                    color="failure" 
                    size="sm" 
                    onClick={() => removeHours(index)}
                  >
                    <HiTrash />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Tips for setting opening hours:</h4>
        <ul className="text-xs text-blue-600 list-disc list-inside">
          <li>Add entries for each day your restaurant is open</li>
          <li>Use 24-hour format for times (e.g., 14:00 for 2 PM)</li>
          <li>Set the closed toggle for days when your restaurant is closed</li>
          <li>For overnight hours, create separate entries for each day</li>
        </ul>
      </div>
    </div>
  );
}