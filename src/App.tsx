import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { SeatsioClient, Region } from "seatsio";
const workSpaceSecretKey = import.meta.env.VITE_WORK_SPACE_SECRET_KEY;
const eventKey = import.meta.env.VITE_EVENT_KEY;
let client = new SeatsioClient(Region.OC(), workSpaceSecretKey);
console.log("client", client);
function App() {
  const seats = [
    {
      zone: "A",
      seats: [
        {
          row: "A",
          numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
        {
          row: "B",
          numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
        {
          row: "C",
          numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
      ],
    },
    {
      zone: "B",
      seats: [
        {
          row: "A",
          numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
        {
          row: "B",
          numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
        {
          row: "C",
          numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
      ],
    },
  ];

  const retrieveObjectInfos = async (labels: string[]) => {
    try {
      const data = await client.events.retrieveObjectInfos(eventKey, labels);
      console.log("data", data);
      return data;
    } catch (error) {
      console.log("error", error);
      return [];
    }
  };

  useEffect(() => {
    const labels = seats.reduce((labels, zone) => {
      zone.seats.map((seat) => {
        seat.numbers.map((seatNumber) => {
          const label = `${zone.zone}-${seat.row}-${seatNumber}`;
          labels.push(label);
        });
      });
      return labels;
    }, [] as string[]);
    retrieveObjectInfos(labels).then((data) => {
      const seatsBooked: string[] = [];
      const seatsHolded: string[] = [];
      for (const seat in data) {
        if (data[seat].status === "booked") {
          seatsBooked.push(seat);
        }
        if (data[seat].status === "reservedByToken") {
          seatsHolded.push(seat);
        }
      }
      setOldBooked((old) => [...old, ...seatsBooked]);
      setSeatsHolded((old) => [...old, ...seatsHolded]);
    });
  }, []);

  const [seatsSelected, setSeatsSelected] = useState<string[]>([]);
  const [oldBooked, setOldBooked] = useState<string[]>([]);
  const [seatsHolded, setSeatsHolded] = useState<string[]>([]);

  const onSelectSeat = (seatNumber: number, row: string, zone: string) => {
    const label = `${zone}-${row}-${seatNumber}`;
    const isExisted = seatsSelected.includes(label);
    const updated = isExisted
      ? seatsSelected.filter((s) => s !== label)
      : [...seatsSelected, label];
    setSeatsSelected((s) => updated);
  };

  const onBook = async () => {
    try {
      const result = await client.events.book(eventKey, seatsSelected);
      alert("success");
      setOldBooked((old) => [...old, ...seatsSelected]);
      setSeatsSelected([]);
      console.log("result", result);
    } catch (error) {
      console.log("error", error);
    }
  };

  const onHold = async () => {
    try {
      let holdToken = await client.holdTokens.create();
      console.log("holdToken", holdToken);
      const result = await client.events.hold(
        eventKey,
        seatsSelected,
        holdToken.holdToken
      );
      alert("success");
      setSeatsHolded((old) => [...old, ...seatsSelected]);
      setSeatsSelected([]);
      console.log("result", result);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="App">
      <h3>Seats</h3>
      <button onClick={onBook}>On Book</button>
      <button onClick={onHold}>On Hold</button>

      <div style={{ display: "flex", gap: "12px" }}>
        <div>
          <span
            style={{
              display: "grid",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              justifyContent: "center",
              alignItems: "center",
              background: "rgb(19 120 136)",
            }}
          ></span>
          <span style={{ color: "#fff" }}>Booked</span>
        </div>

        <div>
          <span
            style={{
              display: "grid",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              justifyContent: "center",
              alignItems: "center",
              background: "rgb(136 48 48)",
            }}
          ></span>
          <span style={{ color: "#fff" }}>Holded</span>
        </div>
        <div>
          <span
            style={{
              display: "grid",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              justifyContent: "center",
              alignItems: "center",
              background: "#fef",
            }}
          ></span>
          <span style={{ color: "#fff" }}>Free</span>
        </div>
      </div>
      {seats.map((s, idx) => (
        <div key={idx}>
          <div>
            <h4>Zone: {s.zone}</h4>
            <div>
              {s.seats.map((seatOfZone, idxSoZ) => (
                <div
                  key={idxSoZ}
                  style={{
                    marginBottom: "10px",
                    padding: "8px",
                    border: "1px solid #eee",
                  }}
                >
                  Row: {seatOfZone.row}
                  <div style={{ display: "flex", gap: "4px" }}>
                    {seatOfZone.numbers.map((n) => {
                      const label = `${s.zone}-${seatOfZone.row}-${n}`;
                      const isNewBooked = seatsSelected.includes(label);

                      const isOldBooked = oldBooked.includes(label);

                      const isHolded = seatsHolded.includes(label);
                      return (
                        <span
                          onClick={
                            !isOldBooked
                              ? () => onSelectSeat(n, seatOfZone.row, s.zone)
                              : undefined
                          }
                          key={n}
                          style={{
                            display: "grid",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: isHolded
                              ? "rgb(136 48 48)"
                              : isOldBooked
                              ? "rgb(19 120 136)"
                              : !isNewBooked
                              ? "#fef"
                              : "rgb(64 62 64)",
                            color: !(isNewBooked || isOldBooked)
                              ? "#000"
                              : "#eee",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: !isOldBooked ? "pointer" : "not-allowed",
                          }}
                        >
                          {n}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
