import React from 'react';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

function ImageGrid({ images }) {
  const [selectedImage, setSelectedImage] = React.useState(null);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  return (
    <Container className="py-4">
      <Row className="g-4">
        {images.map((imageUrl, index) => (
          <Col key={index} xs={12} sm={6} md={4} lg={3}>
            <div className="card shadow-sm h-100 border-0">
              <div className="overflow-hidden" style={{ height: '300px' }}>
                <img
                  src={imageUrl}
                  alt={`image-${index}`}
                  className="card-img-top img-hover-zoom"
                  onClick={() => handleImageClick(imageUrl)}
                  style={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease-in-out'
                  }}
                />
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Full screen modal with zoom support */}
      <Modal
        show={!!selectedImage}
        onHide={handleClose}
        centered
        size="lg"
        className="modal-fullscreen-sm-down"
      >
        <Modal.Body className="p-0 bg-dark">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Zoom>
              <img
                src={selectedImage}
                alt="Selected"
                className="img-fluid"
                style={{
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  filter: 'brightness(1.1) contrast(1.05)',
                  cursor: 'zoom-in'
                }}
              />
            </Zoom>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ImageGrid;
