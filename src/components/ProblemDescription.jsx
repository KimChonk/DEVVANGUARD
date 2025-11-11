import { formatProblemDescription } from "../utils/problemDescriptionParser";
import "../assets/CSS/problemdescription.css";

export default function ProblemDescription({ description }) {
  if (!description) {
    return <p className="no-description">Không có mô tả đề bài</p>;
  }

  const formattedHtml = formatProblemDescription(description);

  return (
    <div className="problem-description">
      <div 
        className="description-content"
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />
    </div>
  );
}
