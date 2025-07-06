import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CardGrid = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://picsum.photos/v2/list?limit=100" // Fetch 100 results
      );
      const allData = await response.json();
      const randomData = getRandomElements(allData, 30); // Get random 30 elements
      setData(randomData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Utility function to get random elements from an array
  const getRandomElements = (arr, n) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  };

  // Navigate to the contact form when the author is clicked
  const handleAuthorClick = (author) => {
    navigate("/contact", { state: { author } });
  };

  return (
    <main>
      {isLoading ? (
        <div>Loading....</div>
      ) : (
        <div className="photo-grid">
          {data.map((card) => (
            <div className="photo-card" key={card.id}>
              <img src={card.download_url} alt={card.author} loading="lazy" />
              <div className="photo-info">
                <h3
                  className="photo-title"
                  onClick={() => handleAuthorClick(card.author)}
                >
                  {card.author}
                </h3>
                <p className="photo-author">{card.author}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default CardGrid;
