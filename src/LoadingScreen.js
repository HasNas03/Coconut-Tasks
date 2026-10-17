const squareColors = ['coral', 'yellow', 'green', 'cyan', 'purple'];

function LoadingScreen({ isRevealing }) {
    return (
        <div
            className={`loading-screen${isRevealing ? ' loading-screen--revealing' : ''}`}
            role="status"
            aria-live="polite"
            aria-label="Loading portfolio"
        >
            <div className="loading-screen__content">
                <span className="loading-screen__label">Loading portfolio</span>
                <div className="loading-screen__squares" aria-hidden="true">
                    {squareColors.map((color, index) => (
                        <span
                            className={`loading-screen__square loading-screen__square--${color}`}
                            key={color}
                            style={{ '--loader-delay': `${140 + index * 270}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LoadingScreen;
