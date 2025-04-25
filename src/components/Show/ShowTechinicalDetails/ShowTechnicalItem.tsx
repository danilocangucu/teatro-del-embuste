function ShowTechnicalDetailItem({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) {
    return (
      <p>
        <span className="fontSecondaryMedium">{label}:</span>{" "}
        <span className="fontSecondaryBold">{value}</span>
      </p>
    );
  }
  
  export default ShowTechnicalDetailItem;
  