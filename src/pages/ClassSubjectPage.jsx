import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getClasses } from "../api/classAPI";
import ClassSubjectManager from "../components/classSubject/ClassSubjectManager";

const ClassSubjectPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const classIdNumber = Number(classId);

  useEffect(() => {
    let ignore = false;

    const loadClasses = async () => {
      try {
        const response = await getClasses();
        const payload = response.data;
        const list = Array.isArray(payload)
          ? payload
          : payload?.data ?? payload?.Data ?? [];

        if (!ignore) {
          setClasses(list);
        }
      } catch {
        if (!ignore) {
          setClasses([]);
        }
      }
    };

    loadClasses();

    return () => {
      ignore = true;
    };
  }, []);

  if (!Number.isInteger(classIdNumber) || classIdNumber <= 0) {
    return <p>Invalid class ID.</p>;
  }

  const selectedClass = classes.find(
    (item) => Number(item.id ?? item.Id) === classIdNumber,
  );
  const className =
    selectedClass?.name ?? selectedClass?.Name ?? `Class ${classIdNumber}`;

  return (
    <ClassSubjectManager
      classId={classIdNumber}
      className={className}
      onClose={() => navigate("/classes")}
      classOptions={classes}
      onClassChange={(nextClassId) => navigate(`/subjects/${nextClassId}`)}
    />
  );
};

export default ClassSubjectPage;
