import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Row, Col, Spinner, Alert } from "react-bootstrap";

const ViewProfile = () => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/user/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(res.data.data);

    } catch (err) {
      console.log(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">

        <Col md={6}>
          <Card className="shadow">

            <Card.Header className="text-center fw-bold">
              My Profile
            </Card.Header>

            <Card.Body>

              {loading && (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              )}

              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              {user && !loading && (
                <>
                  <p>
                    <strong>Name :</strong> {user.name}
                  </p>

                  <p>
                    <strong>Email :</strong> {user.email}
                  </p>

                  <p>
                    <strong>Phone :</strong> {user.phone}
                  </p>

                  <p>
                    <strong>Joined :</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </>
              )}

            </Card.Body>

          </Card>
        </Col>

      </Row>
    </Container>
  );
};

export default ViewProfile;